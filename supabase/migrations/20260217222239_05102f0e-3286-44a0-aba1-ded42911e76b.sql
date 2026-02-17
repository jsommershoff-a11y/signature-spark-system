INSERT INTO public.user_roles (user_id, role)
VALUES ('a3f176a6-ddc6-49ad-908b-f411e01e4dee', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;