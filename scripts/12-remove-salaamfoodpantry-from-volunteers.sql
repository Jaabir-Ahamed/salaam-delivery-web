-- Deactivate salaamfoodpantry@gmail.com in volunteers table
-- Run this AFTER running the previous script to make them super admin
-- This version avoids foreign key constraint issues by deactivating instead of deleting

-- First, verify they exist in admins table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM admins 
        WHERE email = 'salaamfoodpantry@gmail.com'
    ) THEN
        RAISE EXCEPTION 'User salaamfoodpantry@gmail.com not found in admins table. Please run the previous script first.';
    END IF;
END $$;

-- Deactivate the user in volunteers table (safer than deleting)
UPDATE volunteers 
SET active = false, updated_at = NOW()
WHERE email = 'salaamfoodpantry@gmail.com';

-- Verify the deactivation
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'User not found in volunteers table'
        WHEN COUNT(*) = 1 AND NOT EXISTS (
            SELECT 1 FROM volunteers 
            WHERE email = 'salaamfoodpantry@gmail.com' AND active = true
        ) THEN 'User successfully deactivated in volunteers table'
        ELSE 'User still active in volunteers table'
    END as status
FROM volunteers 
WHERE email = 'salaamfoodpantry@gmail.com';

-- Show final status
SELECT 
    'Final Status' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM admins WHERE email = 'salaamfoodpantry@gmail.com' AND active = true) 
        THEN 'User is active in admins table'
        ELSE 'User not active in admins table'
    END as admin_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM volunteers WHERE email = 'salaamfoodpantry@gmail.com' AND active = true) 
        THEN 'User still active in volunteers table'
        ELSE 'User deactivated in volunteers table'
    END as volunteer_status;

-- Show user details in both tables
SELECT 'Admin Table' as table_name, email, name, role, active FROM admins WHERE email = 'salaamfoodpantry@gmail.com'
UNION ALL
SELECT 'Volunteer Table' as table_name, email, name, role, active FROM volunteers WHERE email = 'salaamfoodpantry@gmail.com'; 