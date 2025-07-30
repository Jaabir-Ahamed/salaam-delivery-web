-- Temporarily Disable RLS to Fix Infinite Recursion
-- This is a nuclear option to get the system working immediately

-- Step 1: Disable RLS on all tables completely
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers DISABLE ROW LEVEL SECURITY;
ALTER TABLE seniors DISABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies to clean slate
-- Admins policies
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
DROP POLICY IF EXISTS "admins_allow_all" ON admins;

-- Volunteers policies
DROP POLICY IF EXISTS "volunteers_can_read_own_data" ON volunteers;
DROP POLICY IF EXISTS "volunteers_can_insert_own_data" ON volunteers;
DROP POLICY IF EXISTS "volunteers_can_update_own_data" ON volunteers;
DROP POLICY IF EXISTS "admins_can_manage_volunteers" ON volunteers;
DROP POLICY IF EXISTS "service_role_can_manage_volunteers" ON volunteers;
DROP POLICY IF EXISTS "volunteers_select_policy" ON volunteers;
DROP POLICY IF EXISTS "volunteers_insert_policy" ON volunteers;
DROP POLICY IF EXISTS "volunteers_update_policy" ON volunteers;
DROP POLICY IF EXISTS "volunteers_delete_policy" ON volunteers;
DROP POLICY IF EXISTS "volunteers_allow_all" ON volunteers;

-- Seniors policies
DROP POLICY IF EXISTS "volunteers_can_read_seniors" ON seniors;
DROP POLICY IF EXISTS "admins_can_manage_seniors" ON seniors;
DROP POLICY IF EXISTS "seniors_allow_all" ON seniors;

-- Deliveries policies
DROP POLICY IF EXISTS "volunteers_can_read_own_deliveries" ON deliveries;
DROP POLICY IF EXISTS "volunteers_can_update_own_deliveries" ON deliveries;
DROP POLICY IF EXISTS "admins_can_manage_deliveries" ON deliveries;
DROP POLICY IF EXISTS "deliveries_allow_all" ON deliveries;

-- Step 3: Verify admin user exists
SELECT 
    'Admin User Status (RLS Disabled)' as status,
    au.email,
    au.email_confirmed_at,
    CASE WHEN v.id IS NOT NULL THEN 'Yes' ELSE 'No' END as volunteer_record,
    CASE WHEN a.id IS NOT NULL THEN 'Yes' ELSE 'No' END as admin_record,
    a.role as admin_role
FROM auth.users au
LEFT JOIN volunteers v ON au.id = v.id
LEFT JOIN admins a ON au.id = a.id
WHERE au.email = 'salaamfoodpantry@gmail.com';

-- Step 4: Test all table access
SELECT 'Admins table accessible' as test, COUNT(*) as count FROM admins;
SELECT 'Volunteers table accessible' as test, COUNT(*) as count FROM volunteers;
SELECT 'Seniors table accessible' as test, COUNT(*) as count FROM seniors;
SELECT 'Deliveries table accessible' as test, COUNT(*) as count FROM deliveries;

-- Step 5: Show current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('admins', 'volunteers', 'seniors', 'deliveries')
ORDER BY tablename; 