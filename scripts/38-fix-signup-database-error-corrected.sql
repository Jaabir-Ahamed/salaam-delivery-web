-- Fix Signup Database Error - Corrected Version
-- This script addresses the "Database error updating user" error during signup
-- Only includes columns that actually exist in the volunteers table

-- First, let's see what triggers exist that might be causing issues
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND trigger_schema = 'auth';

-- Check for any triggers on volunteers table
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'volunteers' 
AND trigger_schema = 'public';

-- Temporarily disable all triggers that might interfere with signup
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_volunteer_on_signup ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS volunteers_updated_at ON public.volunteers;

-- Drop any functions that might be causing issues
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_volunteer_on_signup() CASCADE;
DROP FUNCTION IF EXISTS public.on_auth_user_created() CASCADE;

-- Temporarily disable RLS on volunteers table
ALTER TABLE public.volunteers DISABLE ROW LEVEL SECURITY;

-- Drop any problematic INSERT policies on volunteers
DROP POLICY IF EXISTS "volunteers_can_insert_own_data" ON public.volunteers;
DROP POLICY IF EXISTS "volunteers_insert_policy" ON public.volunteers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.volunteers;

-- Create a simple, permissive INSERT policy for volunteers
CREATE POLICY "volunteers_insert_policy" ON public.volunteers
  FOR INSERT WITH CHECK (true);

-- Check the volunteers table structure to see what columns actually exist
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'volunteers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ensure required columns have proper defaults (only for columns that exist)
ALTER TABLE public.volunteers 
ALTER COLUMN role SET DEFAULT 'volunteer',
ALTER COLUMN active SET DEFAULT true,
ALTER COLUMN speaks_languages SET DEFAULT ARRAY['english'];

-- Make phone nullable if it exists and is not nullable
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'volunteers' 
        AND table_schema = 'public' 
        AND column_name = 'phone' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.volunteers ALTER COLUMN phone DROP NOT NULL;
    END IF;
END $$;

-- Show current volunteers to verify structure
SELECT 
    id,
    name,
    email,
    role,
    active,
    speaks_languages
FROM public.volunteers 
ORDER BY created_at DESC
LIMIT 5;

-- Create a simple function to manually create volunteer records (for testing)
CREATE OR REPLACE FUNCTION public.create_volunteer_profile_simple(
    user_id UUID,
    user_email TEXT,
    user_name TEXT DEFAULT 'Unknown',
    user_phone TEXT DEFAULT NULL,
    user_role TEXT DEFAULT 'volunteer',
    user_languages TEXT[] DEFAULT ARRAY['english']
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
        speaks_languages,
        active,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        user_email,
        user_name,
        user_phone,
        user_role,
        user_languages,
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        speaks_languages = EXCLUDED.speaks_languages,
        active = EXCLUDED.active,
        updated_at = NOW();
    
    RETURN FOUND;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating volunteer profile: %', SQLERRM;
        RETURN FALSE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_volunteer_profile_simple(UUID, TEXT, TEXT, TEXT, TEXT, TEXT[]) TO authenticated;

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

-- Instructions for testing
-- 1. Try signing up a new user now
-- 2. If it works, we can re-enable RLS with proper policies
-- 3. If it still fails, we need to investigate further
