-- Fix Volunteers RLS Read Access
-- This script fixes RLS policies to allow reading volunteers in the frontend

-- First, let's see what RLS policies currently exist
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

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'volunteers' 
AND schemaname = 'public';

-- Temporarily disable RLS to test if that's the issue
ALTER TABLE public.volunteers DISABLE ROW LEVEL SECURITY;

-- Test if we can read volunteers without RLS
SELECT COUNT(*) as volunteer_count FROM public.volunteers;

-- Show all volunteers
SELECT id, name, email, role, active FROM public.volunteers ORDER BY name;

-- Re-enable RLS
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "volunteers_read_policy" ON public.volunteers;
DROP POLICY IF EXISTS "volunteers_insert_policy" ON public.volunteers;
DROP POLICY IF EXISTS "volunteers_update_policy" ON public.volunteers;
DROP POLICY IF EXISTS "volunteers_admin_update_policy" ON public.volunteers;
DROP POLICY IF EXISTS "volunteers_admin_delete_policy" ON public.volunteers;
DROP POLICY IF EXISTS "volunteers_insert_allowed" ON public.volunteers;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.volunteers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.volunteers;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.volunteers;
DROP POLICY IF EXISTS "Enable delete for admins only" ON public.volunteers;

-- Create simple, working policies
-- Policy 1: Allow all authenticated users to read volunteers
CREATE POLICY "volunteers_read_all" ON public.volunteers
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy 2: Allow users to insert their own volunteer record
CREATE POLICY "volunteers_insert_self" ON public.volunteers
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Policy 3: Allow users to update their own volunteer record
CREATE POLICY "volunteers_update_self" ON public.volunteers
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy 4: Allow admins to manage all volunteers
CREATE POLICY "volunteers_admin_all" ON public.volunteers
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE admins.id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.volunteers 
            WHERE volunteers.id = auth.uid() 
            AND volunteers.role IN ('admin', 'super_admin')
        )
    );

-- Test the policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'volunteers'
ORDER BY policyname;

-- Test if we can read volunteers with the new policies
SELECT COUNT(*) as volunteer_count FROM public.volunteers;

-- Show all volunteers
SELECT id, name, email, role, active FROM public.volunteers ORDER BY name;

-- If the above still doesn't work, let's try a more permissive approach
-- Create a completely open read policy for testing
DROP POLICY IF EXISTS "volunteers_read_all" ON public.volunteers;
CREATE POLICY "volunteers_read_open" ON public.volunteers
    FOR SELECT
    TO authenticated
    USING (true);

-- Test again
SELECT COUNT(*) as volunteer_count FROM public.volunteers;
SELECT id, name, email, role, active FROM public.volunteers ORDER BY name;
