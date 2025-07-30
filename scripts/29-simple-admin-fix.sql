-- Simple admin fix without deleting records
-- This script fixes the admin setup without triggering foreign key constraints

-- Check current status
SELECT 'Current Status' as info, auth.uid() as current_user_id;

-- Ensure the current user is properly set up as admin
INSERT INTO public.admins (id, email, name, role, active, created_at, updated_at)
SELECT 
  auth.uid(),
  (SELECT email FROM auth.users WHERE id = auth.uid()),
  COALESCE((SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = auth.uid()), 'Admin User'),
  'super_admin',
  true,
  NOW(),
  NOW()
WHERE auth.uid() IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM public.admins WHERE id = auth.uid()
  );

-- Update existing admin to be active and super_admin
UPDATE public.admins
SET 
  role = 'super_admin',
  active = true,
  updated_at = NOW()
WHERE id = auth.uid();

-- Deactivate any duplicate admin records for the same email
UPDATE public.admins
SET 
  active = false,
  updated_at = NOW()
WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  AND id != auth.uid();

-- Deactivate the volunteer record for salaamfoodpantry@gmail.com
UPDATE public.volunteers
SET 
  active = false,
  updated_at = NOW()
WHERE email = 'salaamfoodpantry@gmail.com';

-- Verify the fix
SELECT 
  'Admin Status' as check_type,
  id,
  email,
  name,
  role,
  active,
  created_at
FROM public.admins
WHERE id = auth.uid();

SELECT 
  'All Admins' as check_type,
  id,
  email,
  name,
  role,
  active
FROM public.admins
ORDER BY created_at; 