-- Fix admin active status
-- This script ensures the current user is active in the admins table

-- First, let's see the current user ID
SELECT 'Current User ID' as info, auth.uid() as user_id;

-- Check current admin status
SELECT 
  'Current Admin Status' as check_type,
  id,
  email,
  name,
  role,
  active,
  created_at
FROM public.admins
WHERE id = auth.uid();

-- Update the admin to be active
UPDATE public.admins
SET 
  active = true,
  updated_at = NOW()
WHERE id = auth.uid();

-- Verify the fix
SELECT 
  'Admin Status Fixed' as status,
  id,
  email,
  name,
  role,
  active,
  updated_at
FROM public.admins
WHERE id = auth.uid();

-- Also check if user exists in volunteers table and update if needed
SELECT 
  'Volunteer Status' as check_type,
  id,
  email,
  name,
  role,
  active
FROM public.volunteers
WHERE id = auth.uid();

-- Update volunteer to be active if exists
UPDATE public.volunteers
SET 
  active = true,
  updated_at = NOW()
WHERE id = auth.uid(); 