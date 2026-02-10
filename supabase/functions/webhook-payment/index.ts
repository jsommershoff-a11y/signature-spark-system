import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, stripe-signature',
};

// Stripe event schema
const stripeSessionSchema = z.object({
  id: z.string().min(1),
  customer: z.string().optional(),
  amount_total: z.number().int().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  metadata: z.record(z.string()).optional(),
  status: z.string().optional(),
});

const stripeEventSchema = z.object({
  type: z.string().startsWith('checkout.session'),
  data: z.object({
    object: stripeSessionSchema,
  }),
});

// CopeCart event schema
const copecartOrderSchema = z.object({
  order_id: z.string().min(1),
  email: z.string().email().optional(),
  amount: z.number().nonnegative(),
  currency: z.string().length(3).optional(),
  status: z.string(),
  meta: z.record(z.string()).optional(),
});

const copecartEventSchema = z.object({
  event_type: z.string().optional(),
  order_id: z.string().optional(),
  order_data: copecartOrderSchema.optional(),
});

// Combined schema
const paymentEventSchema = z.union([stripeEventSchema, copecartEventSchema]);

// Verify Stripe webhook signature
async function verifyStripeSignature(
  payload: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature || !secret) return false;
  
  try {
    const encoder = new TextEncoder();
    const parts = signature.split(',');
    const timestamp = parts.find(p => p.startsWith('t='))?.slice(2);
    const sig = parts.find(p => p.startsWith('v1='))?.slice(3);
    
    if (!timestamp || !sig) return false;
    
    // Check timestamp is within 5 minutes
    const age = Math.abs(Date.now() / 1000 - parseInt(timestamp));
    if (age > 300) return false;
    
    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const expectedSig = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedPayload)
    );
    
    // Convert to hex for comparison
    const expectedHex = Array.from(new Uint8Array(expectedSig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return sig === expectedHex;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get raw body for signature verification
    const rawBody = await req.text();
    const stripeSignature = req.headers.get('stripe-signature');
    
    // Parse and validate JSON
    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      console.error('Invalid JSON payload');
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Detect provider and validate signature
    const isStripeEvent = typeof parsedBody === 'object' && parsedBody !== null && 
      'type' in parsedBody && typeof (parsedBody as Record<string, unknown>).type === 'string' &&
      ((parsedBody as Record<string, unknown>).type as string).startsWith('checkout.session');
    
    if (isStripeEvent && stripeWebhookSecret) {
      const isValidSignature = await verifyStripeSignature(rawBody, stripeSignature, stripeWebhookSecret);
      if (!isValidSignature) {
        console.error('Invalid Stripe signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('Stripe signature verified');
    }

    // Validate payload schema
    const parseResult = paymentEventSchema.safeParse(parsedBody);
    if (!parseResult.success) {
      console.error('Schema validation failed:', parseResult.error.message);
      return new Response(
        JSON.stringify({ error: 'Invalid payload structure' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const event = parseResult.data;
    console.log('Payment webhook received:', 'type' in event ? event.type : event.event_type);

    // Determine provider and extract data
    let orderId: string | undefined;
    let leadId: string | undefined;
    let offerId: string | undefined;
    let amountCents: number | undefined;
    let currency = 'EUR';
    let providerOrderId: string | undefined;
    let providerCustomerId: string | undefined;
    let provider: 'stripe' | 'copecart' = 'stripe';
    let isPaymentSuccess = false;

    // Stripe format
    if ('type' in event && event.type?.startsWith('checkout.session')) {
      provider = 'stripe';
      const session = event.data?.object;
      
      if (event.type === 'checkout.session.completed' && session?.status === 'complete') {
        isPaymentSuccess = true;
        orderId = session.metadata?.order_id;
        leadId = session.metadata?.lead_id;
        offerId = session.metadata?.offer_id;
        amountCents = session.amount_total;
        currency = session.currency?.toUpperCase() || 'EUR';
        providerOrderId = session.id;
        providerCustomerId = session.customer;
      }
    }
    // CopeCart format
    else if ('event_type' in event || 'order_data' in event) {
      provider = 'copecart';
      const orderData = event.order_data;
      
      if (event.event_type === 'order.completed' && orderData?.status === 'paid') {
        isPaymentSuccess = true;
        orderId = orderData.meta?.order_id;
        leadId = orderData.meta?.lead_id;
        offerId = orderData.meta?.offer_id;
        amountCents = Math.round(orderData.amount * 100);
        currency = orderData.currency?.toUpperCase() || 'EUR';
        providerOrderId = orderData.order_id;
      }
    }

    if (!isPaymentSuccess) {
      console.log('Ignoring non-success payment event');
      return new Response(
        JSON.stringify({ success: true, message: 'Event ignored' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate lead_id format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!leadId || !uuidRegex.test(leadId)) {
      console.error('Invalid or missing lead_id in payment metadata');
      return new Response(
        JSON.stringify({ error: 'Missing or invalid lead_id in metadata' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate offer_id if present
    if (offerId && !uuidRegex.test(offerId)) {
      console.error('Invalid offer_id format');
      offerId = undefined; // Clear invalid offer_id
    }

    // Find or create order
    let orderRecord;
    
    if (orderId && uuidRegex.test(orderId)) {
      // Update existing order
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          provider_order_id: providerOrderId?.slice(0, 255),
          provider_customer_id: providerCustomerId?.slice(0, 255),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Error updating order:', error);
        throw error;
      }
      orderRecord = data;
    } else {
      // Create new order
      const { data, error } = await supabase
        .from('orders')
        .insert({
          lead_id: leadId,
          offer_id: offerId,
          provider,
          provider_order_id: providerOrderId?.slice(0, 255),
          provider_customer_id: providerCustomerId?.slice(0, 255),
          amount_cents: Math.max(0, Math.min(amountCents || 0, 999999999)), // Bounds check
          currency: currency.slice(0, 3),
          status: 'paid',
          paid_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        throw error;
      }
      orderRecord = data;
    }

    console.log('Order processed:', orderRecord.id);

    // Update offer status to 'paid' and activate membership
    if (offerId) {
      const { data: offerData } = await supabase
        .from('offers')
        .update({
          status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', offerId)
        .select('offer_json, lead_id')
        .single();

      // Activate member + membership based on offer_mode
      if (offerData) {
        const offerJson = offerData.offer_json as Record<string, unknown>;
        const offerMode = offerJson?.offer_mode as string | undefined;

        // Determine membership product from offer_mode
        let membershipProduct: 'starter' | 'growth' | 'premium' = 'growth';
        if (offerMode === 'rocket_performance') {
          membershipProduct = 'premium';
        } else if (offerMode === 'performance') {
          membershipProduct = 'growth';
        }

        // Find user account via lead email
        const { data: leadData } = await supabase
          .from('crm_leads')
          .select('id, email')
          .eq('id', offerData.lead_id)
          .single();

        if (leadData?.email) {
          // Find auth user by email
          const { data: authUsers } = await supabase.auth.admin.listUsers();
          const authUser = authUsers?.users?.find(
            (u: { email?: string }) => u.email?.toLowerCase() === leadData.email.toLowerCase()
          );

          if (authUser) {
            // Create or find member record
            const { data: existingMember } = await supabase
              .from('members')
              .select('id')
              .eq('user_id', authUser.id)
              .single();

            let memberId: string;

            if (existingMember) {
              memberId = existingMember.id;
              // Reactivate if needed
              await supabase
                .from('members')
                .update({ status: 'active', updated_at: new Date().toISOString() })
                .eq('id', memberId);
            } else {
              const { data: newMember, error: memberError } = await supabase
                .from('members')
                .insert({
                  user_id: authUser.id,
                  lead_id: leadData.id,
                  status: 'active',
                })
                .select('id')
                .single();

              if (memberError) {
                console.error('Error creating member:', memberError);
              }
              memberId = newMember?.id;
            }

            // Create membership
            if (memberId) {
              const { error: msError } = await supabase
                .from('memberships')
                .insert({
                  member_id: memberId,
                  order_id: orderRecord.id,
                  product: membershipProduct,
                  status: 'active',
                  starts_at: new Date().toISOString(),
                });

              if (msError) {
                console.error('Error creating membership:', msError);
              } else {
                console.log(`Membership created: ${membershipProduct} for member ${memberId}`);
              }
            }
          } else {
            console.log('No auth user found for lead email:', leadData.email);
          }
        }
      }
    }

    // Pipeline update happens via trigger (update_pipeline_after_payment)

    return new Response(
      JSON.stringify({ 
        success: true, 
        order_id: orderRecord.id,
        message: 'Payment processed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
