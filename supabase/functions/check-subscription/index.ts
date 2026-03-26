import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map Stripe product IDs to membership tiers
const PRODUCT_TO_TIER: Record<string, string> = {
  'prod_UDUDyr4KjEJQB4': 'basic',
  'prod_UDTIV8upy908ms': 'starter',
  'prod_UDTImKXl8RdXyL': 'growth',
  'prod_UDTJx9P04DYXgB': 'premium',
  'prod_UDTJ6NcsaVWjb8': 'premium',
};

const logStep = (step: string, details?: any) => {
  const d = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${d}`);
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

    // Check internal memberships first
    const { data: memberData } = await supabaseClient
      .from('members')
      .select('id, status, memberships(product, status)')
      .eq('user_id', user.id)
      .single();

    const activeMemberships = memberData?.status === 'active'
      ? ((memberData as any).memberships || []).filter((m: any) => m.status === 'active')
      : [];

    const activeMembershipProducts = activeMemberships.map((m: any) => m.product);

    if (customers.data.length === 0) {
      return new Response(JSON.stringify({
        subscribed: activeMemberships.length > 0,
        product_id: null,
        membership_products: activeMembershipProducts,
        subscription_end: null,
        completed_payments: [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;

    // Check active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    // Check completed one-time payments
    const sessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 20,
    });

    const completedPayments = sessions.data
      .filter(s => s.payment_status === 'paid' && s.status === 'complete')
      .map(s => ({
        product_id: s.metadata?.product_id,
        amount: s.amount_total,
        created: s.created,
      }));

    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionProducts: string[] = [];
    let subscriptionEnd: string | null = null;

    if (hasActiveSub) {
      for (const sub of subscriptions.data) {
        const productId = sub.items.data[0]?.price?.product as string;
        const tier = PRODUCT_TO_TIER[productId];
        if (tier) subscriptionProducts.push(tier);
        // Use latest end date
        const end = new Date(sub.current_period_end * 1000).toISOString();
        if (!subscriptionEnd || end > subscriptionEnd) subscriptionEnd = end;
      }
    }

    // Merge Stripe subscription products with internal memberships
    const allProducts = [...new Set([...activeMembershipProducts, ...subscriptionProducts])];

    return new Response(JSON.stringify({
      subscribed: allProducts.length > 0,
      product_id: subscriptions.data[0]?.items.data[0]?.price?.product || null,
      membership_products: allProducts,
      subscription_end: subscriptionEnd,
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
