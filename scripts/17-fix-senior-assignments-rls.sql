-- Fix Senior Assignments RLS Policies
-- Run this script in Supabase SQL editor to fix potential recursion issues

-- 1. First, let's see what policies exist on senior_assignments table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'senior_assignments';

-- 2. Drop all existing policies on senior_assignments table
DROP POLICY IF EXISTS "Admins can view all senior assignments" ON senior_assignments;
DROP POLICY IF EXISTS "Admins can insert senior assignments" ON senior_assignments;
DROP POLICY IF EXISTS "Admins can update senior assignments" ON senior_assignments;
DROP POLICY IF EXISTS "Admins can delete senior assignments" ON senior_assignments;
DROP POLICY IF EXISTS "Volunteers can view their own assignments" ON senior_assignments;

-- 3. Create simplified, non-recursive policies
-- Allow admins to view all senior assignments
CREATE POLICY "Admins can view all senior assignments" ON senior_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.id = auth.uid()
        )
    );

-- Allow admins to insert senior assignments
CREATE POLICY "Admins can insert senior assignments" ON senior_assignments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.id = auth.uid()
        )
    );

-- Allow admins to update senior assignments
CREATE POLICY "Admins can update senior assignments" ON senior_assignments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.id = auth.uid()
        )
    );

-- Allow admins to delete senior assignments
CREATE POLICY "Admins can delete senior assignments" ON senior_assignments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.id = auth.uid()
        )
    );

-- Allow volunteers to view their own assignments
CREATE POLICY "Volunteers can view their own assignments" ON senior_assignments
    FOR SELECT USING (volunteer_id = auth.uid());

-- 4. Verify the policies are created correctly
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'senior_assignments'
ORDER BY policyname;

-- 5. Test a simple query to senior_assignments table
SELECT 
    'Test senior_assignments query' as test,
    COUNT(*) as assignment_count
FROM senior_assignments;

-- 6. Test admin access to senior_assignments
SELECT 
    'Admin access test' as test,
    auth.uid() as current_user_id,
    (SELECT COUNT(*) FROM senior_assignments) as accessible_assignments; 