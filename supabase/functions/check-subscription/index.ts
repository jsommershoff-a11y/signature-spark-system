import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      // Also check internal memberships table
      const { data: memberData } = await supabaseClient
        .from('members')
        .select('id, status, memberships(product, status)')
        .eq('user_id', user.id)
        .single();

      if (memberData?.status === 'active') {
        const activeMembership = (memberData as any).memberships?.find(
          (m: any) => m.status === 'active'
        );
        return new Response(JSON.stringify({
          subscribed: !!activeMembership,
          product_id: null,
          membership_product: activeMembership?.product || null,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    // Also check for successful one-time payments (checkout sessions)
    const sessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 10,
    });

    const completedPayments = sessions.data
      .filter(s => s.payment_status === 'paid' && s.status === 'complete')
      .map(s => ({
        product_id: s.metadata?.product_id,
        amount: s.amount_total,
        created: s.created,
      }));

    const hasActiveSub = subscriptions.data.length > 0;
    let productId = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const sub = subscriptions.data[0];
      subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
      productId = sub.items.data[0].price.product;
    }

    // Also check internal memberships
    const { data: memberData } = await supabaseClient
      .from('members')
      .select('id, status, memberships(product, status)')
      .eq('user_id', user.id)
      .single();

    const activeMembership = memberData?.status === 'active'
      ? (memberData as any).memberships?.find((m: any) => m.status === 'active')
      : null;

    return new Response(JSON.stringify({
      subscribed: hasActiveSub || !!activeMembership,
      product_id: productId,
      subscription_end: subscriptionEnd,
      membership_product: activeMembership?.product || null,
      completed_payments: completedPayments,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[CHECK-SUBSCRIPTION] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
