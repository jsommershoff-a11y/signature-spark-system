-- Add missing offer_status values: accepted, paid
ALTER TYPE public.offer_status ADD VALUE IF NOT EXISTS 'accepted';
ALTER TYPE public.offer_status ADD VALUE IF NOT EXISTS 'paid';