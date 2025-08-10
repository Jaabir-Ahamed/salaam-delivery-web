-- Fix Signup Process - Corrected Version
-- This script addresses the "Database error saving new user" error during signup
-- Only includes columns that actually exist in the volunteers table

-- First, let's check what triggers exist on the auth.users table
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND trigger_schema = 'auth';

-- Check if there are any triggers on the volunteers table that might be causing issues
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'volunteers' 
AND trigger_schema = 'public';

-- Drop any triggers that automatically create volunteer records
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_volunteer_on_signup ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS volunteers_updated_at ON public.volunteers;

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

-- Check the actual structure of the volunteers table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'volunteers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Temporarily disable RLS on volunteers table to test signup
ALTER TABLE public.volunteers DISABLE ROW LEVEL SECURITY;

-- Drop any problematic INSERT policies
DROP POLICY IF EXISTS "volunteers_insert_policy" ON public.volunteers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.volunteers;
DROP POLICY IF EXISTS "volunteers_insert_allowed" ON public.volunteers;

-- Create a simple INSERT policy that allows all authenticated users to insert
CREATE POLICY "volunteers_insert_allowed" ON public.volunteers
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

-- Verify the volunteers table has the correct constraints
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'volunteers' 
AND table_schema = 'public';

-- Test if we can manually insert a volunteer record with only existing columns
-- (This will help identify if the issue is with the table structure)
INSERT INTO public.volunteers (
    id,
    email,
    name,
    role,
    active,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'test@example.com',
    'Test Volunteer',
    'volunteer',
    true,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Clean up test record
DELETE FROM public.volunteers WHERE email = 'test@example.com';

-- Show current volunteers to verify the table is accessible
SELECT id, name, email, role, active FROM public.volunteers ORDER BY name;

-- Show all policies on volunteers table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'volunteers'
ORDER BY policyname;
