-- Auto-Update Senior Assignment Status When Delivery is Completed
-- This script creates a trigger that automatically updates senior_assignments.status to 'completed'
-- when a delivery is marked as 'delivered' or 'family_confirmed'

-- First, let's check if the trigger already exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'auto_update_assignment_on_delivery'
AND event_object_table = 'deliveries';

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

-- Test the trigger by checking current data
SELECT 
    'Current Deliveries' as info,
    COUNT(*) as total_deliveries,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
    COUNT(CASE WHEN status = 'family_confirmed' THEN 1 END) as family_confirmed
FROM public.deliveries;

SELECT 
    'Current Senior Assignments' as info,
    COUNT(*) as total_assignments,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
FROM public.senior_assignments;

-- Show assignments that should be completed based on delivered deliveries
SELECT 
    'Assignments that should be completed' as info,
    sa.id as assignment_id,
    sa.senior_id,
    sa.volunteer_id,
    sa.status as assignment_status,
    d.status as delivery_status,
    s.name as senior_name,
    v.name as volunteer_name
FROM public.senior_assignments sa
JOIN public.deliveries d ON sa.senior_id = d.senior_id AND sa.volunteer_id = d.volunteer_id
JOIN public.seniors s ON sa.senior_id = s.id
JOIN public.volunteers v ON sa.volunteer_id = v.id
WHERE sa.status = 'active' 
AND d.status IN ('delivered', 'family_confirmed');

-- Instructions for testing
-- 1. The trigger is now active
-- 2. When a volunteer marks a delivery as 'delivered' or 'family_confirmed'
-- 3. The corresponding senior assignment will automatically be updated to 'completed'
-- 4. This will be reflected in the admin Senior Assignments page
