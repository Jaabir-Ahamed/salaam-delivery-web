-- Fix Admin Role Detection
-- This script checks and fixes admin role detection issues

-- First, let's see what users we have and their roles
SELECT 
    'Auth Users' as source,
    au.id,
    au.email,
    au.raw_user_meta_data->>'name' as display_name,
    'auth_user' as role_source
FROM auth.users au
WHERE au.email_confirmed_at IS NOT NULL
ORDER BY au.created_at;

-- Check volunteers table
SELECT 
    'Volunteers Table' as source,
    v.id,
    v.email,
    v.name,
    v.role,
    v.active
FROM public.volunteers v
ORDER BY v.created_at;

-- Check admins table
SELECT 
    'Admins Table' as source,
    a.id,
    a.email,
    a.name,
    a.role,
    a.active
FROM public.admins a
ORDER BY a.created_at;

-- Check if the admin user exists in both tables
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'name' as auth_name,
    v.name as volunteer_name,
    v.role as volunteer_role,
    a.name as admin_name,
    a.role as admin_role,
    CASE 
        WHEN a.id IS NOT NULL THEN 'admin_table'
        WHEN v.id IS NOT NULL THEN 'volunteer_table'
        ELSE 'auth_only'
    END as profile_location
FROM auth.users au
LEFT JOIN public.volunteers v ON au.id = v.id
LEFT JOIN public.admins a ON au.id = a.id
WHERE au.email = 'salaamfoodpantry@gmail.com';

-- Ensure admin user has correct role in volunteers table
UPDATE public.volunteers 
SET role = 'super_admin'
WHERE email = 'salaamfoodpantry@gmail.com';

-- Ensure admin user exists in admins table
INSERT INTO public.admins (
    id,
    email,
    name,
    role,
    active,
    created_at,
    updated_at
)
SELECT 
    au.id,
    au.email,
    COALESCE(
        au.raw_user_meta_data->>'name',
        au.raw_user_meta_data->>'full_name',
        'Salaam Food Pantry Admin'
    ) as name,
    'super_admin' as role,
    true as active,
    au.created_at,
    NOW() as updated_at
FROM auth.users au
WHERE au.email = 'salaamfoodpantry@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM public.admins a WHERE a.id = au.id
)
ON CONFLICT (id) DO UPDATE SET
    role = 'super_admin',
    active = true,
    updated_at = NOW();

-- Verify the admin user's role in both tables
SELECT 
    'Final Check - Volunteers' as source,
    v.id,
    v.email,
    v.name,
    v.role,
    v.active
FROM public.volunteers v
WHERE v.email = 'salaamfoodpantry@gmail.com'
UNION ALL
SELECT 
    'Final Check - Admins' as source,
    a.id,
    a.email,
    a.name,
    a.role,
    a.active
FROM public.admins a
WHERE a.email = 'salaamfoodpantry@gmail.com';

-- Test the getCurrentUser logic
-- This simulates what the frontend does
WITH user_check AS (
    SELECT 
        au.id,
        au.email,
        au.raw_user_meta_data->>'name' as auth_name
    FROM auth.users au
    WHERE au.email = 'salaamfoodpantry@gmail.com'
)
SELECT 
    'Admin Profile Check' as test,
    a.id,
    a.email,
    a.name,
    a.role,
    a.active
FROM user_check uc
JOIN public.admins a ON uc.id = a.id
WHERE a.role IN ('admin', 'super_admin')
UNION ALL
SELECT 
    'Volunteer Profile Check' as test,
    v.id,
    v.email,
    v.name,
    v.role,
    v.active
FROM user_check uc
JOIN public.volunteers v ON uc.id = v.id
WHERE v.role IN ('admin', 'super_admin');
