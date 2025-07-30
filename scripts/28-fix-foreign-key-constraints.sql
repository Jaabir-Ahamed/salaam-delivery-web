-- Fix foreign key constraints before cleanup
-- This script handles dependencies before removing duplicate records

-- First, let's see what foreign key constraints exist
SELECT 
  'Foreign Key Constraints' as info,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND (tc.table_name = 'volunteers' OR ccu.table_name = 'volunteers');

-- Check what's referencing the volunteer we want to delete
SELECT 
  'Admin Activity Log References' as info,
  id,
  admin_id,
  action,
  resource_type,
  created_at
FROM public.admin_activity_log
WHERE admin_id = '2e4c6b4a-d2c1-40a0-8670-7dc7d74c4405';

-- Instead of deleting, let's deactivate the volunteer record
UPDATE public.volunteers 
SET 
  active = false,
  updated_at = NOW()
WHERE email = 'salaamfoodpantry@gmail.com';

-- Also deactivate any duplicate admin records (keep the oldest one active)
WITH ranked_admins AS (
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
UPDATE public.admins 
SET 
  active = CASE WHEN rn = 1 THEN true ELSE false END,
  updated_at = NOW()
FROM ranked_admins
WHERE public.admins.id = ranked_admins.id;

-- Ensure the primary admin is properly set up
UPDATE public.admins 
SET 
  role = 'super_admin',
  active = true,
  updated_at = NOW()
WHERE email = 'salaamfoodpantry@gmail.com'
  AND active = true;

-- Verify the results
SELECT 'After Cleanup - Admins' as table_name, id, email, name, role, active FROM public.admins ORDER BY created_at;
SELECT 'After Cleanup - Volunteers' as table_name, id, email, name, role, active FROM public.volunteers ORDER BY created_at; 