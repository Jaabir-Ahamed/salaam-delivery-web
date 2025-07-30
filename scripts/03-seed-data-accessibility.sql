-- Insert sample seniors with accessibility features
INSERT INTO public.seniors (
  id, name, age, household_type, family_adults, family_children, 
  race_ethnicity, health_conditions, address, dietary_restrictions, 
  phone, emergency_contact, has_smartphone, preferred_language, 
  needs_translation, delivery_method, special_instructions
) VALUES
  (
    '650e8400-e29b-41d4-a716-446655440001', 
    'Mrs. Eleanor Johnson', 78, 'single', 1, 0, 
    'Caucasian', 'Hypertension, Hard of hearing', 
    '123 Oak Street, Apt 2A', 'Low sodium', 
    '(555) 123-4567', 'Sarah Johnson (Daughter): (555) 987-6543',
    false, 'english', false, 'phone_confirmed',
    'Ring doorbell twice. Hard of hearing.'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440002', 
    'Mr. Robert Smith', 82, 'single', 1, 0, 
    'African American', 'Diabetes Type 2', 
    '456 Pine Avenue, Unit 5B', 'Diabetic', 
    '(555) 234-5678', 'Maria Rodriguez (Neighbor): (555) 876-5432',
    true, 'english', false, 'phone_confirmed',
    'Prefers morning deliveries before 10 AM.'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440003', 
    'Mrs. Leah Shah', 75, 'single', 1, 0, 
    'South Asian', 'Arthritis', 
    '789 Elm Drive, House', 'Vegetarian', 
    '(555) 345-6789', 'Dr. Patel (Family Doctor): (555) 765-4321',
    false, 'urdu', true, 'family_member',
    'Daughter speaks English. Call family first.'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440004', 
    'Mr. Carlos Rodriguez', 80, 'family', 2, 0, 
    'Hispanic', 'None', 
    '321 Maple Lane, Apt 1A', NULL, 
    '(555) 456-7890', 'Isabella Rodriguez (Granddaughter): (555) 654-3210',
    true, 'spanish', true, 'phone_confirmed',
    'Apartment entrance code: #1234. Speaks some English.'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440005', 
    'Mrs. Amy Chen', 73, 'single', 1, 0, 
    'Asian', 'Celiac Disease', 
    '654 Birch Road, Unit 3C', 'Gluten-free', 
    '(555) 567-8901', 'David Chen (Son): (555) 543-2109',
    true, 'english', false, 'doorstep',
    'Leave at door if no answer. Usually home in afternoons.'
  );

-- Function to create sample deliveries after volunteers are created
CREATE OR REPLACE FUNCTION create_sample_deliveries()
RETURNS void AS $$
DECLARE
  volunteer_id UUID;
  senior_ids UUID[] := ARRAY[
    '650e8400-e29b-41d4-a716-446655440001',
    '650e8400-e29b-41d4-a716-446655440002',
    '650e8400-e29b-41d4-a716-446655440003',
    '650e8400-e29b-41d4-a716-446655440004',
    '650e8400-e29b-41d4-a716-446655440005'
  ];
  i INTEGER;
BEGIN
  -- Get a volunteer ID (will be available after signup)
  SELECT id INTO volunteer_id FROM public.volunteers LIMIT 1;
  
  IF volunteer_id IS NOT NULL THEN
    -- Insert sample deliveries
    FOR i IN 1..5 LOOP
      INSERT INTO public.deliveries (
        senior_id, volunteer_id, delivery_date, status, 
        delivery_method, notes, language_barrier_encountered, 
        translation_needed, completed_at
      ) VALUES (
        senior_ids[i], 
        volunteer_id, 
        '2024-12-15',
        CASE 
          WHEN i <= 3 THEN 'delivered'
          ELSE 'pending'
        END,
        CASE 
          WHEN i = 1 THEN 'phone_confirmed'
          WHEN i = 2 THEN 'phone_confirmed'
          WHEN i = 3 THEN 'family_member'
          ELSE 'doorstep'
        END,
        CASE 
          WHEN i <= 3 THEN 'Delivered successfully'
          ELSE NULL
        END,
        CASE WHEN i = 3 THEN true ELSE false END,
        CASE WHEN i IN (3, 4) THEN true ELSE false END,
        CASE 
          WHEN i <= 3 THEN '2024-12-15 10:30:00'::timestamp
          ELSE NULL
        END
      );
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql;
