
-- Affiliate status enum
CREATE TYPE public.affiliate_status AS ENUM ('pending', 'onboarding', 'active', 'disabled');

-- Commission status enum
CREATE TYPE public.commission_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'cancelled');

-- Generate short unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  done BOOLEAN := FALSE;
BEGIN
  WHILE NOT done LOOP
    code := upper(substr(encode(extensions.gen_random_bytes(6), 'hex'), 1, 8));
    done := NOT EXISTS (SELECT 1 FROM public.affiliates WHERE referral_code = code);
  END LOOP;
  RETURN code;
END;
$$;

-- Affiliates table
CREATE TABLE public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  stripe_account_id TEXT UNIQUE,
  status public.affiliate_status NOT NULL DEFAULT 'pending',
  commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0.30,
  referral_code TEXT NOT NULL UNIQUE,
  payouts_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  charges_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  details_submitted BOOLEAN NOT NULL DEFAULT FALSE,
  invited_by UUID,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  activated_at TIMESTAMPTZ,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX idx_affiliates_referral_code ON public.affiliates(referral_code);
CREATE INDEX idx_affiliates_stripe_account ON public.affiliates(stripe_account_id);

-- Referrals table (clicks + conversions)
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  customer_user_id UUID,
  customer_email TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  landing_path TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  converted_at TIMESTAMPTZ,
  meta JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_referrals_affiliate ON public.referrals(affiliate_id);
CREATE INDEX idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX idx_referrals_lead ON public.referrals(lead_id);
CREATE INDEX idx_referrals_email ON public.referrals(customer_email);

-- Commissions table
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE RESTRICT,
  referral_id UUID REFERENCES public.referrals(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_transfer_id TEXT,
  product_name TEXT,
  gross_amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  commission_rate NUMERIC(5,4) NOT NULL,
  commission_cents INTEGER NOT NULL,
  status public.commission_status NOT NULL DEFAULT 'pending',
  customer_email TEXT,
  paid_at TIMESTAMPTZ,
  failure_reason TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_commissions_affiliate ON public.commissions(affiliate_id);
CREATE INDEX idx_commissions_status ON public.commissions(status);

-- Auto-generate referral_code on insert
CREATE OR REPLACE FUNCTION public.set_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code := public.generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_affiliates_set_code
  BEFORE INSERT ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION public.set_referral_code();

-- updated_at triggers
CREATE TRIGGER trg_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_commissions_updated_at
  BEFORE UPDATE ON public.commissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- AFFILIATES policies
CREATE POLICY "Admins full access affiliates"
  ON public.affiliates FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Affiliates can view own record"
  ON public.affiliates FOR SELECT
  USING (user_id = auth.uid());

-- REFERRALS policies
CREATE POLICY "Admins full access referrals"
  ON public.referrals FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Affiliates can view own referrals"
  ON public.referrals FOR SELECT
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

-- Public insert for click tracking (anyone can register a click via affiliate code)
CREATE POLICY "Public can insert referral clicks"
  ON public.referrals FOR INSERT
  WITH CHECK (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE status = 'active')
  );

-- COMMISSIONS policies
CREATE POLICY "Admins full access commissions"
  ON public.commissions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Affiliates can view own commissions"
  ON public.commissions FOR SELECT
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));
