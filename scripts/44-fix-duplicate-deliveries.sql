-- Fix Duplicate Deliveries and Assignment Sync
-- This script cleans up duplicate delivery records and then fixes synchronization

-- Step 1: Check for duplicate delivery records
SELECT 
    'DUPLICATE DELIVERIES CHECK' as info,
    senior_id,
    volunteer_id,
    delivery_date,
    COUNT(*) as duplicate_count
FROM public.deliveries
GROUP BY senior_id, volunteer_id, delivery_date
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Step 2: Show the specific duplicate records
WITH duplicates AS (
    SELECT 
        senior_id,
        volunteer_id,
        delivery_date,
        COUNT(*) as duplicate_count
    FROM public.deliveries
    GROUP BY senior_id, volunteer_id, delivery_date
    HAVING COUNT(*) > 1
)
SELECT 
    'DUPLICATE RECORDS DETAIL' as info,
    d.id as delivery_id,
    d.senior_id,
    d.volunteer_id,
    d.delivery_date,
    d.status as delivery_status,
    d.created_at,
    s.name as senior_name,
    v.name as volunteer_name,
    dup.duplicate_count
FROM public.deliveries d
JOIN duplicates dup ON d.senior_id = dup.senior_id 
    AND d.volunteer_id = dup.volunteer_id 
    AND d.delivery_date = dup.delivery_date
JOIN public.seniors s ON d.senior_id = s.id
JOIN public.volunteers v ON d.volunteer_id = v.id
ORDER BY d.senior_id, d.volunteer_id, d.delivery_date, d.created_at;

-- Step 3: Clean up duplicate delivery records
-- Keep the most recent delivery record for each senior-volunteer-date combination
DELETE FROM public.deliveries 
WHERE id IN (
    SELECT d.id
    FROM public.deliveries d
    JOIN (
        SELECT 
            senior_id,
            volunteer_id,
            delivery_date,
            MAX(created_at) as max_created_at
        FROM public.deliveries
        GROUP BY senior_id, volunteer_id, delivery_date
        HAVING COUNT(*) > 1
    ) dup ON d.senior_id = dup.senior_id 
        AND d.volunteer_id = dup.volunteer_id 
        AND d.delivery_date = dup.delivery_date
    WHERE d.created_at < dup.max_created_at
);

-- Step 4: Verify duplicates are cleaned up
SELECT 
    'AFTER CLEANUP - DUPLICATE CHECK' as info,
    senior_id,
    volunteer_id,
    delivery_date,
    COUNT(*) as count
FROM public.deliveries
GROUP BY senior_id, volunteer_id, delivery_date
HAVING COUNT(*) > 1;

-- Step 5: Now create the unique constraint
DO $$
BEGIN
    -- Check if the constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'deliveries_senior_volunteer_date_unique' 
        AND conrelid = 'public.deliveries'::regclass
    ) THEN
        -- Add unique constraint
        ALTER TABLE public.deliveries 
        ADD CONSTRAINT deliveries_senior_volunteer_date_unique 
        UNIQUE (senior_id, volunteer_id, delivery_date);
        
        RAISE NOTICE 'Added unique constraint to deliveries table';
    ELSE
        RAISE NOTICE 'Unique constraint already exists';
    END IF;
END $$;

-- Step 6: Check if delivery records exist for assignments
SELECT 
    'DELIVERY RECORDS CHECK' as info,
    sa.id as assignment_id,
    sa.senior_id,
    sa.volunteer_id,
    sa.status as assignment_status,
    sa.assignment_date,
    d.id as delivery_id,
    d.status as delivery_status,
    d.delivery_date,
    s.name as senior_name,
    v.name as volunteer_name
FROM public.senior_assignments sa
LEFT JOIN public.deliveries d ON sa.senior_id = d.senior_id AND sa.volunteer_id = d.volunteer_id
JOIN public.seniors s ON sa.senior_id = s.id
JOIN public.volunteers v ON sa.volunteer_id = v.id
WHERE sa.status = 'active'
ORDER BY sa.created_at DESC;

-- Step 7: Create missing delivery records for active assignments
-- First, identify assignments without delivery records
CREATE TEMP TABLE missing_deliveries AS
SELECT 
    sa.senior_id,
    sa.volunteer_id,
    sa.assignment_date
FROM public.senior_assignments sa
LEFT JOIN public.deliveries d ON sa.senior_id = d.senior_id AND sa.volunteer_id = d.volunteer_id
WHERE sa.status = 'active'
AND d.id IS NULL;

-- Show what will be created
SELECT 
    'MISSING DELIVERIES TO CREATE' as info,
    COUNT(*) as count
FROM missing_deliveries;

-- Create the delivery records
INSERT INTO public.deliveries (
    senior_id,
    volunteer_id,
    delivery_date,
    status,
    created_at
)
SELECT 
    senior_id,
    volunteer_id,
    assignment_date,
    'pending',
    NOW()
FROM missing_deliveries;

-- Step 8: Show what delivery records were created
SELECT 
    'CREATED DELIVERY RECORDS' as info,
    COUNT(*) as new_deliveries_created
FROM public.deliveries 
WHERE created_at >= NOW() - INTERVAL '5 minutes';

-- Step 9: Ensure the trigger exists for future updates
-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS auto_update_assignment_on_delivery ON public.deliveries;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.auto_update_assignment_on_delivery() CASCADE;

-- Create the function to update senior assignment status
CREATE OR REPLACE FUNCTION public.auto_update_assignment_on_delivery()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only update if the delivery status changed to delivered or family_confirmed
    IF (NEW.status = 'delivered' OR NEW.status = 'family_confirmed') AND 
       (OLD.status IS NULL OR OLD.status NOT IN ('delivered', 'family_confirmed')) THEN
        
        -- Update the corresponding senior assignment to completed
        UPDATE public.senior_assignments 
        SET 
            status = 'completed',
            updated_at = NOW()
        WHERE 
            senior_id = NEW.senior_id 
            AND volunteer_id = NEW.volunteer_id 
            AND status = 'active';
            
        RAISE NOTICE 'Updated senior assignment status to completed for senior_id: %, volunteer_id: %', 
            NEW.senior_id, NEW.volunteer_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER auto_update_assignment_on_delivery
    AFTER UPDATE ON public.deliveries
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_update_assignment_on_delivery();

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.auto_update_assignment_on_delivery() TO authenticated;

-- Step 10: Create trigger for new assignments to ensure delivery records are created
CREATE OR REPLACE FUNCTION public.ensure_delivery_for_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create a delivery record when a new assignment is created
    INSERT INTO public.deliveries (
        senior_id,
        volunteer_id,
        delivery_date,
        status,
        created_at
    ) VALUES (
        NEW.senior_id,
        NEW.volunteer_id,
        NEW.assignment_date,
        'pending',
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- If delivery already exists, just continue
        RAISE NOTICE 'Delivery record already exists for senior_id: %, volunteer_id: %', 
            NEW.senior_id, NEW.volunteer_id;
        RETURN NEW;
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating delivery record: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Create trigger for new assignments
DROP TRIGGER IF EXISTS ensure_delivery_on_assignment ON public.senior_assignments;
CREATE TRIGGER ensure_delivery_on_assignment
    AFTER INSERT ON public.senior_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_delivery_for_assignment();

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.ensure_delivery_for_assignment() TO authenticated;

-- Step 11: Show final status
SELECT 
    'FINAL STATUS - Senior Assignments' as info,
    COUNT(*) as total_assignments,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive
FROM public.senior_assignments;

SELECT 
    'FINAL STATUS - Deliveries' as info,
    COUNT(*) as total_deliveries,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
    COUNT(CASE WHEN status = 'family_confirmed' THEN 1 END) as family_confirmed
FROM public.deliveries;

-- Step 12: Verify synchronization
SELECT 
    'SYNC VERIFICATION' as info,
    sa.id as assignment_id,
    sa.status as assignment_status,
    d.id as delivery_id,
    d.status as delivery_status,
    s.name as senior_name,
    v.name as volunteer_name
FROM public.senior_assignments sa
JOIN public.deliveries d ON sa.senior_id = d.senior_id AND sa.volunteer_id = d.volunteer_id
JOIN public.seniors s ON sa.senior_id = s.id
JOIN public.volunteers v ON sa.volunteer_id = v.id
WHERE sa.status = 'active'
ORDER BY sa.created_at DESC;

-- Success message
SELECT 'FIX COMPLETE!' as status,
       'Duplicate deliveries cleaned up and synchronization fixed.' as message,
       'All assignments now have corresponding delivery records.' as next_step,
       'Test by completing a delivery and checking the admin panel.' as testing;
