-- Fix Senior Assignments RLS Policies
-- Run this script in Supabase SQL editor

-- 1. Drop existing RLS policies on senior_assignments table
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.senior_assignments;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.senior_assignments;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.senior_assignments;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.senior_assignments;
DROP POLICY IF EXISTS "Enable all access for admins" ON public.senior_assignments;

-- 2. Enable RLS on senior_assignments table
ALTER TABLE public.senior_assignments ENABLE ROW LEVEL SECURITY;

-- 3. Create new simplified RLS policies
-- Policy for reading assignments (all authenticated users can read)
CREATE POLICY "Enable read access for authenticated users" ON public.senior_assignments
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy for inserting assignments (all authenticated users can insert)
CREATE POLICY "Enable insert access for authenticated users" ON public.senior_assignments
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy for updating assignments (all authenticated users can update)
CREATE POLICY "Enable update access for authenticated users" ON public.senior_assignments
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy for deleting assignments (all authenticated users can delete)
CREATE POLICY "Enable delete access for authenticated users" ON public.senior_assignments
    FOR DELETE
    TO authenticated
    USING (true);

-- 4. Verify the policies were created
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
WHERE tablename = 'senior_assignments'
ORDER BY policyname;

-- 5. Test access to senior_assignments table
SELECT 
    'Test read access' as test_type,
    COUNT(*) as count
FROM public.senior_assignments;

-- 6. Check if there are any existing assignments
SELECT 
    'Existing assignments' as check_type,
    COUNT(*) as total_assignments,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_assignments,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_assignments
FROM public.senior_assignments;

-- 7. Create a test assignment if none exist
DO $$
DECLARE
    test_senior_id UUID;
    test_volunteer_id UUID;
    admin_user_id UUID;
    assignment_count INTEGER;
BEGIN
    -- Check if there are any assignments
    SELECT COUNT(*) INTO assignment_count FROM public.senior_assignments;
    
    IF assignment_count = 0 THEN
        -- Get a test senior and volunteer
        SELECT id INTO test_senior_id FROM public.seniors WHERE active = true LIMIT 1;
        SELECT id INTO test_volunteer_id FROM public.volunteers WHERE active = true LIMIT 1;
        SELECT id INTO admin_user_id FROM auth.users WHERE email = 'salaamfoodpantry@gmail.com' LIMIT 1;
        
        IF test_senior_id IS NOT NULL AND test_volunteer_id IS NOT NULL THEN
            -- Create a test assignment
            INSERT INTO public.senior_assignments (
                senior_id, 
                volunteer_id, 
                assignment_date, 
                status, 
                notes,
                assigned_by
            ) VALUES (
                test_senior_id,
                test_volunteer_id,
                CURRENT_DATE,
                'active',
                'Test assignment created by RLS fix script',
                admin_user_id
            );
            
            RAISE NOTICE 'Created test assignment for senior % and volunteer %', test_senior_id, test_volunteer_id;
        ELSE
            RAISE NOTICE 'No test senior or volunteer found for creating test assignment';
        END IF;
    ELSE
        RAISE NOTICE 'Assignments already exist, no test assignment needed';
    END IF;
END $$; 