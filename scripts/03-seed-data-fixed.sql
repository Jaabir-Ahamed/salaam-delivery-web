-- Insert sample seniors first
INSERT INTO seniors (id, name, age, household_type, family_adults, family_children, race_ethnicity, health_conditions, address, dietary_restrictions, phone, emergency_contact) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'Mrs. Eleanor Johnson', 78, 'single', 1, 0, 'Caucasian', 'Hypertension, Hard of hearing', '123 Oak Street, Apt 2A', 'Low sodium', '(555) 123-4567', 'Sarah Johnson (Daughter): (555) 987-6543'),
  ('650e8400-e29b-41d4-a716-446655440002', 'Mr. Robert Smith', 82, 'single', 1, 0, 'African American', 'Diabetes Type 2', '456 Pine Avenue, Unit 5B', 'Diabetic', '(555) 234-5678', 'Maria Rodriguez (Neighbor): (555) 876-5432'),
  ('650e8400-e29b-41d4-a716-446655440003', 'Mrs. Leah Shah', 75, 'single', 1, 0, 'South Asian', 'Arthritis', '789 Elm Drive, House', 'Vegetarian', '(555) 345-6789', 'Dr. Patel (Family Doctor): (555) 765-4321'),
  ('650e8400-e29b-41d4-a716-446655440004', 'Mr. Carlos Rodriguez', 80, 'family', 2, 0, 'Hispanic', 'None', '321 Maple Lane, Apt 1A', NULL, '(555) 456-7890', 'Isabella Rodriguez (Granddaughter): (555) 654-3210'),
  ('650e8400-e29b-41d4-a716-446655440005', 'Mrs. Amy Chen', 73, 'single', 1, 0, 'Asian', 'Celiac Disease', '654 Birch Road, Unit 3C', 'Gluten-free', '(555) 567-8901', 'David Chen (Son): (555) 543-2109');

-- Note: Volunteers will be created through the signup process
-- This ensures proper Supabase Auth integration

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
  SELECT id INTO volunteer_id FROM volunteers LIMIT 1;
  
  IF volunteer_id IS NOT NULL THEN
    -- Insert sample deliveries with corrected column order
    FOR i IN 1..5 LOOP
      INSERT INTO deliveries (senior_id, volunteer_id, delivery_date, status, notes, completed_at) VALUES
        (senior_ids[i], volunteer_id, '2024-12-15', 
         CASE 
           WHEN i <= 3 THEN 'delivered'
           ELSE 'pending'
         END,
         CASE 
           WHEN i <= 3 THEN 'Delivered successfully'
           ELSE NULL
         END,
         CASE 
           WHEN i <= 3 THEN '2024-12-15 10:30:00'::timestamp
           ELSE NULL
         END);
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql;
