-- Check admin user setup
-- This script helps verify if the current user is properly set up as an admin

-- Check if admins table exists
SELECT 
  'Admins Table Status' as check_type,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'admins'
  ) as table_exists;

-- Check admin users
SELECT 
  'Admin Users' as check_type,
  id,
  email,
  name,
  role,
  active,
  created_at
FROM public.admins
ORDER BY created_at DESC;

-- Check if salaamfoodpantry@gmail.com is an admin
SELECT 
  'Salaam Food Pantry Admin Check' as check_type,
  id,
  email,
  name,
  role,
  active
FROM public.admins
WHERE email = 'salaamfoodpantry@gmail.com';

-- Check volunteers table for the same user
SELECT 
  'Volunteer Check for Salaam Food Pantry' as check_type,
  id,
  email,
  name,
  role,
  active
FROM public.volunteers
WHERE email = 'salaamfoodpantry@gmail.com'; 