
-- Add price_tier enum
CREATE TYPE public.course_price_tier AS ENUM ('freebie', 'low_budget', 'mid_range', 'high_class');

-- Add price_tier and price_cents columns to courses
ALTER TABLE public.courses 
  ADD COLUMN price_tier public.course_price_tier DEFAULT 'freebie',
  ADD COLUMN price_cents integer DEFAULT 0,
  ADD COLUMN includes_done_for_you boolean DEFAULT false;

-- Tag existing courses by level
UPDATE courses SET price_tier = 'freebie', price_cents = 0 WHERE path_level = 'starter';
UPDATE courses SET price_tier = 'low_budget', price_cents = 49900 WHERE path_level = 'fortgeschritten';
UPDATE courses SET price_tier = 'mid_range', price_cents = 500000 WHERE path_level = 'experte';
