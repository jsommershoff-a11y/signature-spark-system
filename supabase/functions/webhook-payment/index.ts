import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface PaymentEvent {
  type: string;
  data?: {
    object?: {
      id?: string;
      customer?: string;
      amount_total?: number;
      currency?: string;
      metadata?: Record<string, string>;
      status?: string;
    };
  };
  // CopeCart format
  event_type?: string;
  order_id?: string;
  order_data?: {
    order_id: string;
    email: string;
    amount: number;
    currency: string;
    status: string;
    meta?: Record<string, string>;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const event: PaymentEvent = await req.json();
    console.log('Payment webhook received:', event.type || event.event_type);

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
    if (event.type?.startsWith('checkout.session')) {
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
        providerCustomerId = session.customer as string;
      }
    }
    // CopeCart format
    else if (event.event_type || event.order_data) {
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

    if (!leadId) {
      console.error('No lead_id in payment metadata');
      return new Response(
        JSON.stringify({ error: 'Missing lead_id in metadata' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Find or create order
    let orderRecord;
    
    if (orderId) {
      // Update existing order
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          provider_order_id: providerOrderId,
          provider_customer_id: providerCustomerId,
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
          provider_order_id: providerOrderId,
          provider_customer_id: providerCustomerId,
          amount_cents: amountCents || 0,
          currency,
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

    // Update offer if exists
    if (offerId) {
      await supabase
        .from('offers')
        .update({
          status: 'viewed',
          updated_at: new Date().toISOString()
        })
        .eq('id', offerId);
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
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
