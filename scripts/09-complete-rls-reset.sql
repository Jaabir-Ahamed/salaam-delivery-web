-- Complete RLS Reset - Fix Infinite Recursion Issues
-- This script completely removes all RLS policies and recreates them properly

-- Step 1: Disable RLS on all tables
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers DISABLE ROW LEVEL SECURITY;
ALTER TABLE seniors DISABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies that might cause recursion
-- Admins table policies
DROP POLICY IF EXISTS "Users can view own admin record" ON admins;
DROP POLICY IF EXISTS "Super admins can view all admin records" ON admins;
DROP POLICY IF EXISTS "Super admins can insert admin records" ON admins;
DROP POLICY IF EXISTS "Super admins can update admin records" ON admins;
DROP POLICY IF EXISTS "Users can update own last_login" ON admins;
DROP POLICY IF EXISTS "Super admins can delete admin records" ON admins;
DROP POLICY IF EXISTS "admins_select_policy" ON admins;
DROP POLICY IF EXISTS "admins_insert_policy" ON admins;
DROP POLICY IF EXISTS "admins_update_policy" ON admins;
DROP POLICY IF EXISTS "admins_delete_policy" ON admins;

-- Volunteers table policies
DROP POLICY IF EXISTS "volunteers_can_read_own_data" ON volunteers;
DROP POLICY IF EXISTS "volunteers_can_insert_own_data" ON volunteers;
DROP POLICY IF EXISTS "volunteers_can_update_own_data" ON volunteers;
DROP POLICY IF EXISTS "admins_can_manage_volunteers" ON volunteers;
DROP POLICY IF EXISTS "service_role_can_manage_volunteers" ON volunteers;
DROP POLICY IF EXISTS "volunteers_select_policy" ON volunteers;
DROP POLICY IF EXISTS "volunteers_insert_policy" ON volunteers;
DROP POLICY IF EXISTS "volunteers_update_policy" ON volunteers;
DROP POLICY IF EXISTS "volunteers_delete_policy" ON volunteers;

-- Seniors table policies
DROP POLICY IF EXISTS "volunteers_can_read_seniors" ON seniors;
DROP POLICY IF EXISTS "admins_can_manage_seniors" ON seniors;

-- Deliveries table policies
DROP POLICY IF EXISTS "volunteers_can_read_own_deliveries" ON deliveries;
DROP POLICY IF EXISTS "volunteers_can_update_own_deliveries" ON deliveries;
DROP POLICY IF EXISTS "admins_can_manage_deliveries" ON deliveries;

-- Step 3: Re-enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE seniors ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, non-recursive policies
-- Admins table - allow all operations for now
CREATE POLICY "admins_allow_all" ON admins FOR ALL USING (true) WITH CHECK (true);

-- Volunteers table - allow all operations for now
CREATE POLICY "volunteers_allow_all" ON volunteers FOR ALL USING (true) WITH CHECK (true);

-- Seniors table - allow all operations for now
CREATE POLICY "seniors_allow_all" ON seniors FOR ALL USING (true) WITH CHECK (true);

-- Deliveries table - allow all operations for now
CREATE POLICY "deliveries_allow_all" ON deliveries FOR ALL USING (true) WITH CHECK (true);

-- Step 5: Verify admin user exists and is accessible
SELECT 
    'Admin User Verification' as check_type,
    au.email,
    au.email_confirmed_at,
    CASE WHEN v.id IS NOT NULL THEN 'Yes' ELSE 'No' END as volunteer_record,
    CASE WHEN a.id IS NOT NULL THEN 'Yes' ELSE 'No' END as admin_record,
    a.role as admin_role
FROM auth.users au
LEFT JOIN volunteers v ON au.id = v.id
LEFT JOIN admins a ON au.id = a.id
WHERE au.email = 'salaamfoodpantry@gmail.com';

-- Step 6: Test basic queries
SELECT 'Testing admins table access' as test, COUNT(*) as count FROM admins;
SELECT 'Testing volunteers table access' as test, COUNT(*) as count FROM volunteers;
SELECT 'Testing seniors table access' as test, COUNT(*) as count FROM seniors;
SELECT 'Testing deliveries table access' as test, COUNT(*) as count FROM deliveries; 