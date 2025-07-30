-- Admin User Creation Script
-- This script creates an admin user record in the volunteers table
-- Note: You need to create the auth user first through the app or Supabase dashboard

-- First, check if admin user already exists
DO $$
DECLARE
    admin_volunteer_id UUID;
    admin_auth_id UUID;
BEGIN
    -- Check if admin volunteer record exists
    SELECT id INTO admin_volunteer_id 
    FROM volunteers 
    WHERE email = 'salaamfoodpantry@gmail.com';
    
    -- Check if auth user exists (this will be created through signup)
    SELECT id INTO admin_auth_id 
    FROM auth.users 
    WHERE email = 'salaamfoodpantry@gmail.com';
    
    -- If auth user exists but no volunteer record, create it
    IF admin_auth_id IS NOT NULL AND admin_volunteer_id IS NULL THEN
        INSERT INTO volunteers (id, email, name, phone, role, active, speaks_languages, created_at, updated_at) 
        VALUES (
            admin_auth_id,
            'salaamfoodpantry@gmail.com',
            'Admin User',
            NULL,
            'admin',
            true,
            ARRAY['english'],
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Admin volunteer record created for auth user: %', admin_auth_id;
    ELSIF admin_auth_id IS NULL THEN
        RAISE NOTICE 'Auth user not found. Please create the auth user first through signup or Supabase dashboard.';
    ELSIF admin_volunteer_id IS NOT NULL THEN
        RAISE NOTICE 'Admin volunteer record already exists.';
    END IF;
END $$;

-- Show current admin users
SELECT 
    v.id,
    v.email,
    v.name,
    v.role,
    v.active,
    CASE 
        WHEN au.id IS NOT NULL THEN 'Auth user exists'
        ELSE 'No auth user'
    END as auth_status
FROM volunteers v
LEFT JOIN auth.users au ON v.id = au.id
WHERE v.role = 'admin'; 