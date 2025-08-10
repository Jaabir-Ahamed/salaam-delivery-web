-- Temporarily Disable Authentication for Testing
-- This script removes auth requirements to test if the app works without auth

-- Disable RLS on all tables to allow unrestricted access
ALTER TABLE public.volunteers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.seniors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.senior_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;

-- Drop all RLS policies to prevent any auth-related issues
-- Volunteers table
DROP POLICY IF EXISTS "volunteers_read_policy" ON public.volunteers;
DROP POLICY IF EXISTS "volunteers_insert_policy" ON public.volunteers;
DROP POLICY IF EXISTS "volunteers_update_policy" ON public.volunteers;
DROP POLICY IF EXISTS "volunteers_admin_update_policy" ON public.volunteers;
DROP POLICY IF EXISTS "volunteers_admin_delete_policy" ON public.volunteers;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.volunteers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.volunteers;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.volunteers;
DROP POLICY IF EXISTS "Enable delete for admins only" ON public.volunteers;

-- Seniors table
DROP POLICY IF EXISTS "seniors_read_policy" ON public.seniors;
DROP POLICY IF EXISTS "seniors_insert_policy" ON public.seniors;
DROP POLICY IF EXISTS "seniors_update_policy" ON public.seniors;
DROP POLICY IF EXISTS "seniors_delete_policy" ON public.seniors;

-- Deliveries table
DROP POLICY IF EXISTS "deliveries_read_policy" ON public.deliveries;
DROP POLICY IF EXISTS "deliveries_insert_policy" ON public.deliveries;
DROP POLICY IF EXISTS "deliveries_update_policy" ON public.deliveries;
DROP POLICY IF EXISTS "deliveries_delete_policy" ON public.deliveries;

-- Senior assignments table
DROP POLICY IF EXISTS "senior_assignments_read_policy" ON public.senior_assignments;
DROP POLICY IF EXISTS "senior_assignments_insert_policy" ON public.senior_assignments;
DROP POLICY IF EXISTS "senior_assignments_update_policy" ON public.senior_assignments;
DROP POLICY IF EXISTS "senior_assignments_delete_policy" ON public.senior_assignments;

-- Admins table
DROP POLICY IF EXISTS "admins_read_policy" ON public.admins;
DROP POLICY IF EXISTS "admins_insert_policy" ON public.admins;
DROP POLICY IF EXISTS "admins_update_policy" ON public.admins;
DROP POLICY IF EXISTS "admins_delete_policy" ON public.admins;

-- Verify tables are accessible
SELECT 'volunteers' as table_name, COUNT(*) as count FROM public.volunteers
UNION ALL
SELECT 'seniors' as table_name, COUNT(*) as count FROM public.seniors
UNION ALL
SELECT 'deliveries' as table_name, COUNT(*) as count FROM public.deliveries
UNION ALL
SELECT 'senior_assignments' as table_name, COUNT(*) as count FROM public.senior_assignments
UNION ALL
SELECT 'admins' as table_name, COUNT(*) as count FROM public.admins;

-- Show current volunteers
SELECT id, name, email, role, active FROM public.volunteers ORDER BY name;
