-- Sync Auth Users to Volunteers Table
-- This script syncs users from auth.users to public.volunteers table

-- First, let's see what users exist in auth.users but not in volunteers
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'name' as display_name,
    au.raw_user_meta_data->>'full_name' as full_name,
    au.raw_user_meta_data->>'phone' as phone,
    CASE 
        WHEN au.email = 'salaamfoodpantry@gmail.com' THEN 'super_admin'
        ELSE 'volunteer'
    END as suggested_role
FROM auth.users au
LEFT JOIN public.volunteers v ON au.id = v.id
WHERE v.id IS NULL
AND au.email_confirmed_at IS NOT NULL
ORDER BY au.created_at;

-- Show current volunteers table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'volunteers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Temporarily disable RLS to allow inserts
ALTER TABLE public.volunteers DISABLE ROW LEVEL SECURITY;

-- Insert missing users from auth.users to volunteers table
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

-- Verify the sync worked
SELECT 
    'Before sync' as status,
    COUNT(*) as volunteer_count
FROM public.volunteers
UNION ALL
SELECT 
    'After sync' as status,
    COUNT(*) as volunteer_count
FROM public.volunteers;

-- Show all volunteers now
SELECT 
    id,
    name,
    email,
    role,
    active,
    created_at
FROM public.volunteers 
ORDER BY created_at;

-- Show auth users vs volunteers comparison
SELECT 
    'Auth Users' as source,
    COUNT(*) as count
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL
UNION ALL
SELECT 
    'Volunteers' as source,
    COUNT(*) as count
FROM public.volunteers;

-- Create a function to automatically sync new users in the future
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only create volunteer record if email is confirmed
    IF NEW.email_confirmed_at IS NOT NULL THEN
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
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(
                NEW.raw_user_meta_data->>'name',
                NEW.raw_user_meta_data->>'full_name',
                'Unknown User'
            ),
            NEW.raw_user_meta_data->>'phone',
            CASE 
                WHEN NEW.email = 'salaamfoodpantry@gmail.com' THEN 'super_admin'
                ELSE 'volunteer'
            END,
            ARRAY['english'],
            NULL,
            NEW.created_at,
            NOW(),
            true
        ) ON CONFLICT (id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger to automatically sync new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create trigger to sync when email is confirmed
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
    EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.volunteers TO authenticated;

-- Show the triggers we created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND trigger_schema = 'auth';
