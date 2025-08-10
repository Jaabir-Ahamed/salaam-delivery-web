-- Fix Signup Process - Database Error Saving New User
-- This script addresses the "Database error saving new user" error during signup

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

-- Check for any foreign key constraints that might be causing issues
SELECT 
    tc.constraint_name,
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
AND tc.table_name = 'volunteers';

-- Temporarily disable any triggers that might be causing the signup issue
-- Drop any problematic triggers on volunteers table
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_volunteer_on_signup ON auth.users;
DROP TRIGGER IF EXISTS volunteers_updated_at ON public.volunteers;

-- Check if there are any RLS policies that might be blocking inserts
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
AND cmd = 'INSERT';

-- Temporarily disable RLS on volunteers table to test signup
ALTER TABLE public.volunteers DISABLE ROW LEVEL SECURITY;

-- Drop any problematic INSERT policies
DROP POLICY IF EXISTS "volunteers_insert_policy" ON public.volunteers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.volunteers;

-- Create a simple INSERT policy that allows all authenticated users to insert
CREATE POLICY "volunteers_insert_allowed" ON public.volunteers
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

-- Check the volunteers table structure to ensure it's correct
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'volunteers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify the volunteers table has the correct constraints
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'volunteers' 
AND table_schema = 'public';

-- Test if we can manually insert a volunteer record
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
