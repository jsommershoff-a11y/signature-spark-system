-- Step 01: Add new role values to existing app_role enum
-- and migrate existing user data. Keep old values in enum (unused).

-- Add new enum values
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'vertriebspartner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'gruppenbetreuer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'member_basic';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'member_starter';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'member_pro';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'guest';