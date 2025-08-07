-- Comprehensive Senior Assignments Fix
-- Run this script in Supabase SQL editor

-- 1. First, let's check if the senior_assignments table exists and has the right structure
DO $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'senior_assignments') THEN
        RAISE EXCEPTION 'senior_assignments table does not exist';
    END IF;
    
    RAISE NOTICE 'senior_assignments table exists';
END $$;

-- 2. Add missing columns if they don't exist
ALTER TABLE public.senior_assignments 
ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Ensure the table has the correct structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'senior_assignments'
ORDER BY ordinal_position;

-- 4. Completely disable RLS temporarily to test access
ALTER TABLE public.senior_assignments DISABLE ROW LEVEL SECURITY;

-- 5. Test basic access
SELECT 
    'Basic access test' as test_type,
    COUNT(*) as assignment_count
FROM public.senior_assignments;

-- 6. Check if there are any assignments
SELECT 
    'Assignment count' as check_type,
    COUNT(*) as total_assignments,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_assignments
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
                'Test assignment created by comprehensive fix script',
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

-- 8. Test the join queries that the frontend uses
SELECT 
    'Join test with seniors' as test_type,
    COUNT(*) as count
FROM public.senior_assignments sa
JOIN public.seniors s ON sa.senior_id = s.id;

SELECT 
    'Join test with volunteers' as test_type,
    COUNT(*) as count
FROM public.senior_assignments sa
JOIN public.volunteers v ON sa.volunteer_id = v.id;

-- 9. Test the full query that the frontend uses
SELECT 
    sa.*,
    s.name as senior_name,
    s.address as senior_address,
    v.name as volunteer_name,
    v.email as volunteer_email
FROM public.senior_assignments sa
LEFT JOIN public.seniors s ON sa.senior_id = s.id
LEFT JOIN public.volunteers v ON sa.volunteer_id = v.id
ORDER BY sa.created_at DESC;

-- 10. Re-enable RLS with simple policies
ALTER TABLE public.senior_assignments ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.senior_assignments;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.senior_assignments;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.senior_assignments;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.senior_assignments;

-- Create simple policies that allow all authenticated users full access
CREATE POLICY "Enable all access for authenticated users" ON public.senior_assignments
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 11. Test access with RLS enabled
SELECT 
    'RLS enabled access test' as test_type,
    COUNT(*) as count
FROM public.senior_assignments; 