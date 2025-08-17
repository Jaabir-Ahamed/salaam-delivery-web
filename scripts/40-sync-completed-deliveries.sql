-- Sync Completed Deliveries with Senior Assignments
-- This script manually updates senior_assignments.status to 'completed' for any assignments
-- that have corresponding deliveries marked as 'delivered' or 'family_confirmed'

-- First, let's see what needs to be synced
SELECT 
    'Assignments that need to be completed' as info,
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

-- Update senior assignments to completed where deliveries are already delivered
UPDATE public.senior_assignments 
SET 
    status = 'completed',
    updated_at = NOW()
WHERE id IN (
    SELECT sa.id
    FROM public.senior_assignments sa
    JOIN public.deliveries d ON sa.senior_id = d.senior_id AND sa.volunteer_id = d.volunteer_id
    WHERE sa.status = 'active' 
    AND d.status IN ('delivered', 'family_confirmed')
);

-- Show the results after sync
SELECT 
    'After Sync - Senior Assignments' as info,
    COUNT(*) as total_assignments,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive
FROM public.senior_assignments;

-- Show specific assignments that were updated
SELECT 
    'Updated Assignments' as info,
    sa.id as assignment_id,
    sa.senior_id,
    sa.volunteer_id,
    sa.status as assignment_status,
    d.status as delivery_status,
    s.name as senior_name,
    v.name as volunteer_name,
    sa.updated_at
FROM public.senior_assignments sa
JOIN public.deliveries d ON sa.senior_id = d.senior_id AND sa.volunteer_id = d.volunteer_id
JOIN public.seniors s ON sa.senior_id = s.id
JOIN public.volunteers v ON sa.volunteer_id = v.id
WHERE sa.status = 'completed' 
AND d.status IN ('delivered', 'family_confirmed')
ORDER BY sa.updated_at DESC;

-- Verify no assignments are still active when they should be completed
SELECT 
    'Verification - Any remaining mismatches' as info,
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
