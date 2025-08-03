-- Fix Infinite Recursion in Volunteers RLS Policies
-- Run this script in Supabase SQL editor to fix the recursion issue

-- 1. First, let's see what policies exist on volunteers table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'volunteers';

-- 2. Drop all existing policies on volunteers table
DROP POLICY IF EXISTS "Volunteers can read own record" ON volunteers;
DROP POLICY IF EXISTS "Admins can read all volunteers" ON volunteers;
DROP POLICY IF EXISTS "Volunteers can update own record" ON volunteers;
DROP POLICY IF EXISTS "Admins can manage volunteers" ON volunteers;
DROP POLICY IF EXISTS "Volunteers can view own profile" ON volunteers;
DROP POLICY IF EXISTS "Admins can view all volunteers" ON volunteers;
DROP POLICY IF EXISTS "Volunteers can update own profile" ON volunteers;
DROP POLICY IF EXISTS "Admins can manage all volunteers" ON volunteers;

-- 3. Create simplified, non-recursive policies
-- Allow volunteers to read their own record
CREATE POLICY "Volunteers can read own record" ON volunteers
    FOR SELECT USING (auth.uid() = id);

-- Allow admins to read all volunteer records (simplified)
CREATE POLICY "Admins can read all volunteers" ON volunteers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.id = auth.uid()
        )
    );

-- Allow volunteers to update their own record
CREATE POLICY "Volunteers can update own record" ON volunteers
    FOR UPDATE USING (auth.uid() = id);

-- Allow admins to insert/update/delete volunteer records (simplified)
CREATE POLICY "Admins can manage volunteers" ON volunteers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.id = auth.uid()
        )
    );

-- 4. Verify the policies are created correctly
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'volunteers'
ORDER BY policyname;

-- 5. Test a simple query to volunteers table
SELECT 
    'Test volunteers query' as test,
    COUNT(*) as volunteer_count
FROM volunteers;

-- 6. Test admin access to volunteers
SELECT 
    'Admin access test' as test,
    auth.uid() as current_user_id,
    (SELECT COUNT(*) FROM volunteers) as accessible_volunteers; 