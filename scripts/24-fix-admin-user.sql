-- Fix admin user issues
-- This script ensures the current user is properly set up as an admin

-- First, let's see what we're working with
SELECT 'Current auth.uid()' as info, auth.uid() as user_id;

-- Check if the current user exists in admins table
SELECT 
  'Current User Admin Status' as check_type,
  id,
  email,
  name,
  role,
  active
FROM public.admins
WHERE id = auth.uid();

-- If the user doesn't exist in admins table, create them
INSERT INTO public.admins (id, email, name, role, active, created_at, updated_at)
SELECT 
  auth.uid(),
  (SELECT email FROM auth.users WHERE id = auth.uid()),
  COALESCE((SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = auth.uid()), 'Admin User'),
  'admin',
  true,
  NOW(),
  NOW()
WHERE auth.uid() IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM public.admins WHERE id = auth.uid()
  );

-- Update existing admin to be active if they exist
UPDATE public.admins
SET active = true, updated_at = NOW()
WHERE id = auth.uid() AND active = false;

-- Verify the fix
SELECT 
  'Admin User Fixed' as status,
  id,
  email,
  name,
  role,
  active
FROM public.admins
WHERE id = auth.uid(); 