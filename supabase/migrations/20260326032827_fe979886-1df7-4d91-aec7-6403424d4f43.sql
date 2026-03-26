-- Step 01b: Migrate existing roles to new role values
-- geschaeftsfuehrung -> admin, teamleiter -> gruppenbetreuer, 
-- mitarbeiter -> vertriebspartner, kunde -> member_basic

-- First handle potential unique constraint conflicts by deleting duplicates
-- (e.g. if user already has 'admin' and we try to migrate 'geschaeftsfuehrung' to 'admin')
DELETE FROM public.user_roles a
USING public.user_roles b
WHERE a.id > b.id
  AND a.user_id = b.user_id
  AND (
    (a.role::text = 'geschaeftsfuehrung' AND b.role::text = 'admin')
    OR (b.role::text = 'geschaeftsfuehrung' AND a.role::text = 'admin')
  );

-- Now migrate
UPDATE public.user_roles SET role = 'admin'::public.app_role WHERE role::text = 'geschaeftsfuehrung';
UPDATE public.user_roles SET role = 'gruppenbetreuer'::public.app_role WHERE role::text = 'teamleiter';
UPDATE public.user_roles SET role = 'vertriebspartner'::public.app_role WHERE role::text = 'mitarbeiter';
UPDATE public.user_roles SET role = 'member_basic'::public.app_role WHERE role::text = 'kunde';

-- Migrate invitations too
UPDATE public.invitations SET role = 'admin'::public.app_role WHERE role::text = 'geschaeftsfuehrung';
UPDATE public.invitations SET role = 'gruppenbetreuer'::public.app_role WHERE role::text = 'teamleiter';
UPDATE public.invitations SET role = 'vertriebspartner'::public.app_role WHERE role::text = 'mitarbeiter';
UPDATE public.invitations SET role = 'member_basic'::public.app_role WHERE role::text = 'kunde';

-- Update has_min_role to work with new hierarchy
CREATE OR REPLACE FUNCTION public.has_min_role(_user_id uuid, _min_role public.app_role)
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
        CASE ur.role::text
          WHEN 'admin' THEN 100
          WHEN 'vertriebspartner' THEN 50
          WHEN 'gruppenbetreuer' THEN 50
          WHEN 'member_pro' THEN 30
          WHEN 'member_starter' THEN 20
          WHEN 'member_basic' THEN 10
          WHEN 'guest' THEN 0
          ELSE 0
        END
      ) >= (
        CASE _min_role::text
          WHEN 'admin' THEN 100
          WHEN 'vertriebspartner' THEN 50
          WHEN 'gruppenbetreuer' THEN 50
          WHEN 'member_pro' THEN 30
          WHEN 'member_starter' THEN 20
          WHEN 'member_basic' THEN 10
          WHEN 'guest' THEN 0
          ELSE 0
        END
      )
  )
$$;