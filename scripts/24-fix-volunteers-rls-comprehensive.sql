-- Comprehensive Fix for Volunteers Table RLS Policies
-- This script addresses the 500 errors when accessing volunteers table

-- First, let's check the current state
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
WHERE tablename = 'volunteers';

-- Disable RLS temporarily to see if that fixes the issue
ALTER TABLE public.volunteers DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on volunteers table
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.volunteers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.volunteers;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.volunteers;
DROP POLICY IF EXISTS "Enable delete for admins only" ON public.volunteers;
DROP POLICY IF EXISTS "volunteers_select_policy" ON public.volunteers;
DROP POLICY IF EXISTS "volunteers_insert_policy" ON public.volunteers;
DROP POLICY IF EXISTS "volunteers_update_policy" ON public.volunteers;
DROP POLICY IF EXISTS "volunteers_delete_policy" ON public.volunteers;

-- Re-enable RLS
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- Policy 1: Allow all authenticated users to read volunteers
CREATE POLICY "volunteers_read_policy" ON public.volunteers
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: Allow users to insert their own volunteer record
CREATE POLICY "volunteers_insert_policy" ON public.volunteers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy 3: Allow users to update their own volunteer record
CREATE POLICY "volunteers_update_policy" ON public.volunteers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Allow admins to update any volunteer record
CREATE POLICY "volunteers_admin_update_policy" ON public.volunteers
  FOR UPDATE
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

-- Policy 5: Allow admins to delete volunteer records
CREATE POLICY "volunteers_admin_delete_policy" ON public.volunteers
  FOR DELETE
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
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'volunteers'
ORDER BY policyname;

-- Verify we can read from volunteers table
SELECT COUNT(*) as volunteer_count FROM public.volunteers;

-- Show current volunteers
SELECT id, name, email, role, active FROM public.volunteers ORDER BY name;
