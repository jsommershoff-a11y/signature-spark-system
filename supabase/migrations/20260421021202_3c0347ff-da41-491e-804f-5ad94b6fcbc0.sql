
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.set_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code := public.generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$;
