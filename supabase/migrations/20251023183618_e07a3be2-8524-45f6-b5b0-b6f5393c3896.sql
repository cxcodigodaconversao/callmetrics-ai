-- Insert profiles for existing users that don't have one
INSERT INTO public.profiles (id, email, name)
SELECT 
  u.id,
  u.email,
  u.name
FROM public.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;