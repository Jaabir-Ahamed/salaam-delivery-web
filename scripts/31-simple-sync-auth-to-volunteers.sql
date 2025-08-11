-- Simple Sync: Auth Users to Volunteers Table
-- This script just syncs existing users without creating triggers

-- Show what users are missing from volunteers table
SELECT 
    'Missing from volunteers:' as status,
    au.id,
    au.email,
    COALESCE(
        au.raw_user_meta_data->>'name',
        au.raw_user_meta_data->>'full_name',
        'Unknown User'
    ) as name
FROM auth.users au
LEFT JOIN public.volunteers v ON au.id = v.id
WHERE v.id IS NULL
AND au.email_confirmed_at IS NOT NULL;

-- Temporarily disable RLS
ALTER TABLE public.volunteers DISABLE ROW LEVEL SECURITY;

-- Insert the missing users
INSERT INTO public.volunteers (
    id,
    email,
    name,
    phone,
    role,
    speaks_languages,
    profile_picture,
    created_at,
    updated_at,
    active
)
SELECT 
    au.id,
    au.email,
    COALESCE(
        au.raw_user_meta_data->>'name',
        au.raw_user_meta_data->>'full_name',
        'Unknown User'
    ) as name,
    au.raw_user_meta_data->>'phone' as phone,
    CASE 
        WHEN au.email = 'salaamfoodpantry@gmail.com' THEN 'super_admin'
        ELSE 'volunteer'
    END as role,
    ARRAY['english'] as speaks_languages,
    NULL as profile_picture,
    au.created_at,
    NOW() as updated_at,
    true as active
FROM auth.users au
LEFT JOIN public.volunteers v ON au.id = v.id
WHERE v.id IS NULL
AND au.email_confirmed_at IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Re-enable RLS
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

-- Show the results
SELECT 
    'Auth Users (confirmed)' as source,
    COUNT(*) as count
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL
UNION ALL
SELECT 
    'Volunteers' as source,
    COUNT(*) as count
FROM public.volunteers;

-- Show all volunteers now
SELECT 
    id,
    name,
    email,
    role,
    active
FROM public.volunteers 
ORDER BY created_at;
