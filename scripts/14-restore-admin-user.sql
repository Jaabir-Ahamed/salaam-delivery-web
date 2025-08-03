-- Restore Admin User and Fix Role Issues
-- Run this script in Supabase SQL editor to restore admin functionality

-- 1. Update the user's role back to admin in auth.users
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
)
WHERE id = '2e4c6b4a-d2c1-40a0-8670-7dc7d74c4405';

-- 2. Update the volunteer record to have admin role
UPDATE volunteers 
SET role = 'admin'
WHERE id = '2e4c6b4a-d2c1-40a0-8670-7dc7d74c4405';

-- 3. Ensure the user exists in the admins table
INSERT INTO admins (id, name, email, phone, role)
SELECT 
    '2e4c6b4a-d2c1-40a0-8670-7dc7d74c4405',
    COALESCE(raw_user_meta_data->>'name', 'Admin User'),
    email,
    raw_user_meta_data->>'phone',
    'admin'
FROM auth.users 
WHERE id = '2e4c6b4a-d2c1-40a0-8670-7dc7d74c4405'
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    updated_at = NOW();

-- 4. Verify the user has admin role
SELECT 
    id,
    email,
    raw_user_meta_data->>'role' as auth_role,
    (SELECT role FROM volunteers WHERE id = auth.users.id) as volunteer_role,
    (SELECT role FROM admins WHERE id = auth.users.id) as admin_role
FROM auth.users 
WHERE id = '2e4c6b4a-d2c1-40a0-8670-7dc7d74c4405';

-- 5. Check if admin dashboard should be accessible
-- The user should now have role = 'admin' in all tables 