-- Clean up duplicate admin and volunteer records
-- This script removes duplicates and ensures proper user setup

-- First, let's see what we have
SELECT 'Current Admins' as table_name, id, email, name, role, active FROM public.admins ORDER BY created_at;
SELECT 'Current Volunteers' as table_name, id, email, name, role, active FROM public.volunteers ORDER BY created_at;

-- Remove duplicate admin records (keep the oldest one)
WITH duplicates AS (
  SELECT 
    id,
    email,
    name,
    role,
    active,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at ASC) as rn
  FROM public.admins
)
DELETE FROM public.admins 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Remove duplicate volunteer records (keep the oldest one)
WITH duplicates AS (
  SELECT 
    id,
    email,
    name,
    role,
    active,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at ASC) as rn
  FROM public.volunteers
)
DELETE FROM public.volunteers 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Remove salaamfoodpantry@gmail.com from volunteers table (should only be in admins)
DELETE FROM public.volunteers 
WHERE email = 'salaamfoodpantry@gmail.com';

-- Ensure salaamfoodpantry@gmail.com is properly set up as admin
UPDATE public.admins 
SET 
  role = 'super_admin',
  active = true,
  updated_at = NOW()
WHERE email = 'salaamfoodpantry@gmail.com';

-- Verify the cleanup
SELECT 'After Cleanup - Admins' as table_name, id, email, name, role, active FROM public.admins ORDER BY created_at;
SELECT 'After Cleanup - Volunteers' as table_name, id, email, name, role, active FROM public.volunteers ORDER BY created_at; 