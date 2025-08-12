-- Quick Admin Role Fix
-- This script quickly fixes the admin role detection issue

-- Check current admin user status
SELECT 
    'Current Status' as status,
    au.id,
    au.email,
    v.role as volunteer_role,
    a.role as admin_role
FROM auth.users au
LEFT JOIN public.volunteers v ON au.id = v.id
LEFT JOIN public.admins a ON au.id = a.id
WHERE au.email = 'salaamfoodpantry@gmail.com';

-- Fix admin user in volunteers table
UPDATE public.volunteers 
SET role = 'super_admin', active = true
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
    'Salaam Food Pantry Admin' as name,
    'super_admin' as role,
    true as active,
    au.created_at,
    NOW() as updated_at
FROM auth.users au
WHERE au.email = 'salaamfoodpantry@gmail.com'
ON CONFLICT (id) DO UPDATE SET
    role = 'super_admin',
    active = true,
    updated_at = NOW();

-- Verify the fix
SELECT 
    'After Fix - Volunteers' as source,
    v.id,
    v.email,
    v.name,
    v.role,
    v.active
FROM public.volunteers v
WHERE v.email = 'salaamfoodpantry@gmail.com'
UNION ALL
SELECT 
    'After Fix - Admins' as source,
    a.id,
    a.email,
    a.name,
    a.role,
    a.active
FROM public.admins a
WHERE a.email = 'salaamfoodpantry@gmail.com';
