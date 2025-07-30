-- Insert sample volunteers
INSERT INTO volunteers (id, email, name, phone, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@salamfoodpantry.org', 'Admin User', '(555) 123-4567', 'admin'),
  ('550e8400-e29b-41d4-a716-446655440002', 'volunteer@salamfoodpantry.org', 'Sarah Ahmed', '(555) 234-5678', 'volunteer'),
  ('550e8400-e29b-41d4-a716-446655440003', 'mike@salamfoodpantry.org', 'Mike Rodriguez', '(555) 345-6789', 'volunteer');

-- Insert sample seniors
INSERT INTO seniors (id, name, age, household_type, family_adults, family_children, race_ethnicity, health_conditions, address, dietary_restrictions, phone, emergency_contact) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'Mrs. Eleanor Johnson', 78, 'single', 1, 0, 'Caucasian', 'Hypertension, Hard of hearing', '123 Oak Street, Apt 2A', 'Low sodium', '(555) 123-4567', 'Sarah Johnson (Daughter): (555) 987-6543'),
  ('650e8400-e29b-41d4-a716-446655440002', 'Mr. Robert Smith', 82, 'single', 1, 0, 'African American', 'Diabetes Type 2', '456 Pine Avenue, Unit 5B', 'Diabetic', '(555) 234-5678', 'Maria Rodriguez (Neighbor): (555) 876-5432'),
  ('650e8400-e29b-41d4-a716-446655440003', 'Mrs. Leah Shah', 75, 'single', 1, 0, 'South Asian', 'Arthritis', '789 Elm Drive, House', 'Vegetarian', '(555) 345-6789', 'Dr. Patel (Family Doctor): (555) 765-4321'),
  ('650e8400-e29b-41d4-a716-446655440004', 'Mr. Carlos Rodriguez', 80, 'family', 2, 0, 'Hispanic', 'None', '321 Maple Lane, Apt 1A', NULL, '(555) 456-7890', 'Isabella Rodriguez (Granddaughter): (555) 654-3210'),
  ('650e8400-e29b-41d4-a716-446655440005', 'Mrs. Amy Chen', 73, 'single', 1, 0, 'Asian', 'Celiac Disease', '654 Birch Road, Unit 3C', 'Gluten-free', '(555) 567-8901', 'David Chen (Son): (555) 543-2109');

-- Insert sample deliveries for current month
INSERT INTO deliveries (senior_id, volunteer_id, delivery_date, status, notes, completed_at) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '2024-12-15', 'delivered', 'Delivered successfully, very grateful', '2024-12-15 10:30:00'),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'delivered', '2024-12-15', 'Delivered successfully', '2024-12-15 11:00:00'),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '2024-12-15', 'delivered', 'Enjoyed brief conversation', '2024-12-15 11:30:00'),
  ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '2024-12-15', 'pending', NULL, NULL),
  ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', '2024-12-15', 'pending', NULL, NULL);
