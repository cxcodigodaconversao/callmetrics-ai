-- Add admin role for the specified user
-- First, we need to find the user_id for the email
-- Then insert the admin role

-- Insert admin role for the user (this will only work after the user signs up)
-- Since we can't query auth.users directly in a migration, we'll create a function
-- that can be called manually or triggered

-- Create a function to add admin role by email
CREATE OR REPLACE FUNCTION public.add_admin_by_email(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Get the user_id from auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  -- If user exists, add admin role
  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
END;
$$;

-- Now call the function to add admin role to the specified email
SELECT public.add_admin_by_email('cxcodigodaconversao@gmail.com');