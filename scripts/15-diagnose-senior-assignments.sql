-- Diagnose Senior Assignments Issues
-- Run this script in Supabase SQL editor to check the current state

-- 1. Check if senior_assignments table exists
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'senior_assignments';

-- 2. Check senior_assignments table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'senior_assignments'
ORDER BY ordinal_position;

-- 3. Check if there are any senior_assignments records
SELECT COUNT(*) as total_assignments FROM senior_assignments;

-- 4. Check if there are any active seniors
SELECT COUNT(*) as total_seniors FROM seniors WHERE active = true;

-- 5. Check if there are any volunteers
SELECT COUNT(*) as total_volunteers FROM volunteers WHERE active = true;

-- 6. Check RLS policies on senior_assignments
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'senior_assignments';

-- 7. Test a simple query to senior_assignments
SELECT 
    'Test query result' as test,
    COUNT(*) as assignment_count
FROM senior_assignments;

-- 8. Check if the current user has access to senior_assignments
SELECT 
    'Current user access test' as test,
    auth.uid() as current_user_id,
    (SELECT COUNT(*) FROM senior_assignments) as accessible_assignments;

-- 9. Check seniors table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'seniors'
ORDER BY ordinal_position;

-- 10. Check volunteers table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'volunteers'
ORDER BY ordinal_position; 