-- Allow public (unauthenticated) users to accept offers via public_token
-- This updates status from sent/viewed to accepted and updates offer_json with contract data
CREATE POLICY "Public can accept via token"
ON public.offers
FOR UPDATE
USING (
  public_token IS NOT NULL
  AND status IN ('sent'::offer_status, 'viewed'::offer_status)
)
WITH CHECK (
  public_token IS NOT NULL
  AND status = 'accepted'::offer_status
);