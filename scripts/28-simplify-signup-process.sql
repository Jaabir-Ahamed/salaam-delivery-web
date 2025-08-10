-- Simplify Signup Process
-- This script removes automatic volunteer creation during signup to prevent database errors

-- First, let's check if there are any triggers that automatically create volunteer records
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND trigger_schema = 'auth';

-- Drop any triggers that automatically create volunteer records
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_volunteer_on_signup ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Check if there are any functions that might be called by triggers
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%volunteer%'
OR routine_name LIKE '%user%'
OR routine_name LIKE '%signup%';

-- Drop any functions that might be causing issues
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_volunteer_on_signup() CASCADE;
DROP FUNCTION IF EXISTS public.on_auth_user_created() CASCADE;

-- Ensure volunteers table has proper defaults for required fields
ALTER TABLE public.volunteers 
ALTER COLUMN role SET DEFAULT 'volunteer',
ALTER COLUMN active SET DEFAULT true,
ALTER COLUMN speaks_languages SET DEFAULT ARRAY['english'],
ALTER COLUMN availability SET DEFAULT ARRAY[]::text[],
ALTER COLUMN vehicle_type SET DEFAULT 'car',
ALTER COLUMN vehicle_capacity SET DEFAULT 1,
ALTER COLUMN experience_level SET DEFAULT 'beginner',
ALTER COLUMN special_skills SET DEFAULT '',
ALTER COLUMN notes SET DEFAULT '';

-- Make some fields nullable to prevent signup issues
ALTER TABLE public.volunteers 
ALTER COLUMN address DROP NOT NULL,
ALTER COLUMN phone DROP NOT NULL,
ALTER COLUMN emergency_contact DROP NOT NULL,
ALTER COLUMN profile_picture DROP NOT NULL;

-- Create a simple function to manually create volunteer records (for admin use)
CREATE OR REPLACE FUNCTION public.create_volunteer_profile(
    user_id UUID,
    user_email TEXT,
    user_name TEXT DEFAULT 'Unknown',
    user_phone TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.volunteers (
        id,
        email,
        name,
        phone,
        role,
        active,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        user_email,
        user_name,
        user_phone,
        'volunteer',
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;
    
    RETURN FOUND;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating volunteer profile: %', SQLERRM;
        RETURN FALSE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_volunteer_profile(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- Show current volunteers
SELECT id, name, email, role, active FROM public.volunteers ORDER BY name;

-- Test the function
-- SELECT public.create_volunteer_profile(
--     '00000000-0000-0000-0000-000000000000'::UUID,
--     'test@example.com',
--     'Test User',
--     '1234567890'
-- );
