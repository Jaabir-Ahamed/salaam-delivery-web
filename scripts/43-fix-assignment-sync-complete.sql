-- Complete Fix for Assignment-Delivery Synchronization
-- This script fixes the ON CONFLICT error and ensures proper sync

-- Step 1: Check current table structure
SELECT 
    'DELIVERIES TABLE STRUCTURE' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'deliveries' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Check existing constraints
SELECT 
    'EXISTING CONSTRAINTS' as info,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.deliveries'::regclass;

-- Step 3: Create unique constraint for deliveries table (if it doesn't exist)
-- This prevents duplicate delivery records for the same senior-volunteer-date combination
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

-- Step 4: Check if delivery records exist for assignments
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

-- Step 5: Create missing delivery records for active assignments (without ON CONFLICT)
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

-- Step 6: Show what delivery records were created
SELECT 
    'CREATED DELIVERY RECORDS' as info,
    COUNT(*) as new_deliveries_created
FROM public.deliveries 
WHERE created_at >= NOW() - INTERVAL '5 minutes';

-- Step 7: Ensure the trigger exists for future updates
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

-- Step 8: Create trigger for new assignments to ensure delivery records are created
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

-- Step 9: Show final status
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

-- Step 10: Verify synchronization
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
       'All assignments now have corresponding delivery records.' as message,
       'Triggers are active for automatic synchronization.' as next_step,
       'Test by completing a delivery and checking the admin panel.' as testing;
