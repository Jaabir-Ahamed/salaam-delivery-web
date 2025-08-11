-- Temporarily Disable RLS for Testing
-- This script disables RLS on all tables to test if that's causing the read issues

-- Disable RLS on all tables
ALTER TABLE public.volunteers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.seniors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.senior_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;

-- Test if we can read from all tables
SELECT 'volunteers' as table_name, COUNT(*) as count FROM public.volunteers
UNION ALL
SELECT 'seniors' as table_name, COUNT(*) as count FROM public.seniors
UNION ALL
SELECT 'deliveries' as table_name, COUNT(*) as count FROM public.deliveries
UNION ALL
SELECT 'senior_assignments' as table_name, COUNT(*) as count FROM public.senior_assignments
UNION ALL
SELECT 'admins' as table_name, COUNT(*) as count FROM public.admins;

-- Show all volunteers
SELECT id, name, email, role, active FROM public.volunteers ORDER BY name;

-- Show all seniors
SELECT id, name, email, active FROM public.seniors ORDER BY name LIMIT 5;

-- Show table RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('volunteers', 'seniors', 'deliveries', 'senior_assignments', 'admins')
ORDER BY tablename;
