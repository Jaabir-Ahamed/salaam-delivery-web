-- Fix volunteers table role constraint to allow super_admin
-- Run this script in Supabase SQL editor

-- 1. Drop the existing check constraint
ALTER TABLE public.volunteers 
DROP CONSTRAINT IF EXISTS volunteers_role_check;

-- 2. Create new check constraint that allows super_admin
ALTER TABLE public.volunteers 
ADD CONSTRAINT volunteers_role_check 
CHECK (role IN ('volunteer', 'admin', 'super_admin'));

-- 3. Verify the constraint was created correctly
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.volunteers'::regclass 
AND contype = 'c'
AND conname = 'volunteers_role_check';

-- 4. Test inserting a super_admin user
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the admin user ID
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'salaamfoodpantry@gmail.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- Try to insert/update the volunteer record with super_admin role
        INSERT INTO volunteers (id, email, name, role, active)
        VALUES (admin_user_id, 'salaamfoodpantry@gmail.com', 'Salaam Food Pantry Admin', 'super_admin', true)
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            name = EXCLUDED.name,
            role = EXCLUDED.role,
            active = EXCLUDED.active,
            updated_at = NOW();
            
        RAISE NOTICE 'Successfully updated volunteer record for admin user: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin user not found in auth.users';
    END IF;
END $$; 