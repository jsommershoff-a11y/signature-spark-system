ALTER TABLE public.offer_drafts DROP CONSTRAINT IF EXISTS offer_drafts_status_check;
ALTER TABLE public.offer_drafts
  ADD CONSTRAINT offer_drafts_status_check
  CHECK (status = ANY (ARRAY[
    'draft'::text,
    'review_required'::text,
    'correction'::text,
    'approved'::text,
    'sent'::text,
    'rejected'::text,
    'negotiation'::text,
    'info_requested'::text
  ]));