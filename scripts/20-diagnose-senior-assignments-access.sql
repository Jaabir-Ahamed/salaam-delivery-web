-- Diagnose Senior Assignments Access Issues
-- Run this script in Supabase SQL editor to identify the problem

-- 1. Check if the senior_assignments table exists and has data
SELECT 
    'Table exists' as check_type,
    COUNT(*) as count,
    'senior_assignments' as table_name
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'senior_assignments'

UNION ALL

SELECT 
    'Table has data' as check_type,
    COUNT(*) as count,
    'senior_assignments' as table_name
FROM public.senior_assignments;

-- 2. Check RLS policies on senior_assignments table
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
WHERE tablename = 'senior_assignments';

-- 3. Check if current user can access senior_assignments
SELECT 
    'Current user can read' as check_type,
    COUNT(*) as count
FROM public.senior_assignments
LIMIT 1;

-- 4. Check if there are any assignments with proper relationships
SELECT 
    'Assignments with seniors' as check_type,
    COUNT(*) as count
FROM public.senior_assignments sa
JOIN public.seniors s ON sa.senior_id = s.id;

-- 5. Check if there are any assignments with proper volunteer relationships
SELECT 
    'Assignments with volunteers' as check_type,
    COUNT(*) as count
FROM public.senior_assignments sa
JOIN public.volunteers v ON sa.volunteer_id = v.id;

-- 6. Check the structure of senior_assignments table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'senior_assignments'
ORDER BY ordinal_position;

-- 7. Check for any recent assignments
SELECT 
    'Recent assignments' as check_type,
    COUNT(*) as count,
    MIN(created_at) as earliest,
    MAX(created_at) as latest
FROM public.senior_assignments;

-- 8. Test a simple insert to see if RLS is blocking writes
DO $$
DECLARE
    test_senior_id UUID;
    test_volunteer_id UUID;
    insert_result RECORD;
BEGIN
    -- Get a test senior and volunteer
    SELECT id INTO test_senior_id FROM public.seniors WHERE active = true LIMIT 1;
    SELECT id INTO test_volunteer_id FROM public.volunteers WHERE active = true LIMIT 1;
    
    IF test_senior_id IS NOT NULL AND test_volunteer_id IS NOT NULL THEN
        -- Try to insert a test assignment
        INSERT INTO public.senior_assignments (
            senior_id, 
            volunteer_id, 
            assignment_date, 
            status, 
            notes
        ) VALUES (
            test_senior_id,
            test_volunteer_id,
            CURRENT_DATE,
            'active',
            'Test assignment for diagnostics'
        ) RETURNING * INTO insert_result;
        
        RAISE NOTICE 'Test insert successful: %', insert_result.id;
        
        -- Clean up the test assignment
        DELETE FROM public.senior_assignments WHERE id = insert_result.id;
        RAISE NOTICE 'Test assignment cleaned up';
    ELSE
        RAISE NOTICE 'No test senior or volunteer found for insert test';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Test insert failed: %', SQLERRM;
END $$; 