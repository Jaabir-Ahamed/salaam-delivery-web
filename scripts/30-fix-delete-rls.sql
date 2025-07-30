-- Fix RLS policies for deleting senior assignments
-- This script ensures admins can delete assignments

-- Check current RLS policies
SELECT 
  'Current RLS Policies' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'senior_assignments'
ORDER BY policyname;

-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Admins can delete senior assignments" ON public.senior_assignments;

-- Create a new, more permissive delete policy for admins
CREATE POLICY "Admins can delete senior assignments" ON public.senior_assignments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE id = auth.uid() AND active = true
    )
  );

-- Also ensure the insert and update policies are working
DROP POLICY IF EXISTS "Admins can insert senior assignments" ON public.senior_assignments;
CREATE POLICY "Admins can insert senior assignments" ON public.senior_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE id = auth.uid() AND active = true
    )
  );

DROP POLICY IF EXISTS "Admins can update senior assignments" ON public.senior_assignments;
CREATE POLICY "Admins can update senior assignments" ON public.senior_assignments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE id = auth.uid() AND active = true
    )
  );

-- Verify the policies
SELECT 
  'Updated RLS Policies' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'senior_assignments'
ORDER BY policyname;

-- Test if current user can access the table
SELECT 
  'Current User Access Test' as info,
  auth.uid() as user_id,
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid() AND active = true
  ) as is_admin,
  EXISTS (
    SELECT 1 FROM public.senior_assignments 
    LIMIT 1
  ) as can_access_table; 