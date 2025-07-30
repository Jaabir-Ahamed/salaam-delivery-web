-- Make salaamfoodpantry@gmail.com the Primary Admin with Super Admin role
-- This script moves the user from volunteers table to admins table

-- First, let's check if the user exists in volunteers table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM volunteers 
        WHERE email = 'salaamfoodpantry@gmail.com'
    ) THEN
        RAISE EXCEPTION 'User salaamfoodpantry@gmail.com not found in volunteers table';
    END IF;
END $$;

-- Insert the user into admins table with super_admin role
INSERT INTO admins (
    id,
    email,
    name,
    role,
    active,
    created_at,
    updated_at
)
SELECT 
    id,
    email,
    name,
    'super_admin' as role,
    active,
    created_at,
    NOW() as updated_at
FROM volunteers 
WHERE email = 'salaamfoodpantry@gmail.com'
ON CONFLICT (email) DO UPDATE SET
    role = 'super_admin',
    active = true,
    updated_at = NOW();

-- Update the user's auth metadata to reflect the new role
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"super_admin"'
)
WHERE email = 'salaamfoodpantry@gmail.com';

-- Optionally, you can remove the user from volunteers table
-- Uncomment the following line if you want to remove them from volunteers table
-- DELETE FROM volunteers WHERE email = 'salaamfoodpantry@gmail.com';

-- Verify the change
SELECT 
    'Admin created/updated successfully' as status,
    email,
    name,
    role,
    active
FROM admins 
WHERE email = 'salaamfoodpantry@gmail.com'; 