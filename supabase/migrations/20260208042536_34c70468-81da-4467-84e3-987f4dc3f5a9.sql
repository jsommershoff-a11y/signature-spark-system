-- Step 1: Extend app_role enum with CRM-specific roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'kunde';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'mitarbeiter';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'teamleiter';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'geschaeftsfuehrung';

-- Step 2: Extend profiles table with CRM fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.profiles(id);

-- Step 3: Create index for assigned_to lookups
CREATE INDEX IF NOT EXISTS idx_profiles_assigned_to ON public.profiles(assigned_to);

-- Step 4: Update handle_new_user function to also set email from auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url, email, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$;