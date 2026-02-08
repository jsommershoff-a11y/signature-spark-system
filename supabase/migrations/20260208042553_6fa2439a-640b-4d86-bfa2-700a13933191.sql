-- Step 5: Create function to assign default role to new users
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, 'kunde');
  RETURN NEW;
END;
$$;

-- Step 6: Create trigger to auto-assign 'kunde' role when profile is created
DROP TRIGGER IF EXISTS on_profile_created_assign_role ON public.profiles;
CREATE TRIGGER on_profile_created_assign_role
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_role();

-- Step 7: Create helper function to check minimum role level (hierarchical)
CREATE OR REPLACE FUNCTION public.has_min_role(_user_id uuid, _min_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND (
        CASE ur.role
          WHEN 'admin' THEN 5
          WHEN 'geschaeftsfuehrung' THEN 4
          WHEN 'teamleiter' THEN 3
          WHEN 'mitarbeiter' THEN 2
          WHEN 'kunde' THEN 1
          ELSE 0
        END
      ) >= (
        CASE _min_role
          WHEN 'admin' THEN 5
          WHEN 'geschaeftsfuehrung' THEN 4
          WHEN 'teamleiter' THEN 3
          WHEN 'mitarbeiter' THEN 2
          WHEN 'kunde' THEN 1
          ELSE 0
        END
      )
  )
$$;

-- Step 8: Update profiles RLS policies for hierarchical access
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;

-- Users and staff can view profiles based on role
CREATE POLICY "Staff can view profiles based on role"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_min_role(auth.uid(), 'mitarbeiter')
);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Allow insert via trigger (auth.uid() will be null during trigger execution)
-- This is safe because the trigger is SECURITY DEFINER
CREATE POLICY "Allow profile creation via trigger"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() IS NULL OR auth.uid() = user_id);

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'));