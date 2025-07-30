-- Comprehensive fix for admin login issues
-- This script addresses RLS policy violations and email confirmation problems

-- 1. Fix RLS policies for volunteers table
DROP POLICY IF EXISTS "volunteers_can_insert_own_data" ON public.volunteers;
DROP POLICY IF EXISTS "admins_can_manage_volunteers" ON public.volunteers;

-- Create more permissive policies for admin user creation
CREATE POLICY "volunteers_can_insert_own_data" ON public.volunteers
  FOR INSERT WITH CHECK (
    auth.uid() = id OR
    (auth.jwt() ->> 'email') = 'salaamfoodpantry@gmail.com' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
    auth.role() = 'service_role'
  );

CREATE POLICY "admins_can_manage_volunteers" ON public.volunteers
  FOR ALL USING (
    (auth.jwt() ->> 'email') = 'salaamfoodpantry@gmail.com' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() AND active = true
    ) OR
    auth.role() = 'service_role'
  );

-- 2. Confirm admin user email
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Find the admin user
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'salaamfoodpantry@gmail.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- Update the user to confirm email
        UPDATE auth.users 
        SET email_confirmed_at = NOW(),
            updated_at = NOW()
        WHERE id = admin_user_id;
        
        RAISE NOTICE 'Admin user email confirmed: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin user not found';
    END IF;
END $$;

-- 3. Ensure admin record exists
DO $$
DECLARE
    admin_user_id UUID;
    admin_record_exists BOOLEAN;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'salaamfoodpantry@gmail.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- Check if admin record exists
        SELECT EXISTS(
            SELECT 1 FROM admins WHERE id = admin_user_id
        ) INTO admin_record_exists;
        
        IF NOT admin_record_exists THEN
            -- Create admin record
            INSERT INTO admins (id, email, name, role, active, created_at, updated_at)
            VALUES (
                admin_user_id,
                'salaamfoodpantry@gmail.com',
                'Admin User',
                'super_admin',
                true,
                NOW(),
                NOW()
            );
            RAISE NOTICE 'Admin record created for user: %', admin_user_id;
        ELSE
            RAISE NOTICE 'Admin record already exists for user: %', admin_user_id;
        END IF;
    END IF;
END $$;

-- 4. Ensure volunteer record exists
DO $$
DECLARE
    admin_user_id UUID;
    volunteer_record_exists BOOLEAN;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'salaamfoodpantry@gmail.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- Check if volunteer record exists
        SELECT EXISTS(
            SELECT 1 FROM volunteers WHERE id = admin_user_id
        ) INTO volunteer_record_exists;
        
        IF NOT volunteer_record_exists THEN
            -- Create volunteer record
            INSERT INTO volunteers (id, email, name, phone, role, active, speaks_languages, created_at, updated_at)
            VALUES (
                admin_user_id,
                'salaamfoodpantry@gmail.com',
                'Admin User',
                NULL,
                'admin',
                true,
                ARRAY['english'],
                NOW(),
                NOW()
            );
            RAISE NOTICE 'Volunteer record created for admin user: %', admin_user_id;
        ELSE
            RAISE NOTICE 'Volunteer record already exists for admin user: %', admin_user_id;
        END IF;
    END IF;
END $$;

-- 5. Show final status
SELECT 
    'Admin User Status' as status,
    au.email,
    au.email_confirmed_at,
    CASE WHEN v.id IS NOT NULL THEN 'Yes' ELSE 'No' END as volunteer_record,
    CASE WHEN a.id IS NOT NULL THEN 'Yes' ELSE 'No' END as admin_record,
    a.role as admin_role
FROM auth.users au
LEFT JOIN volunteers v ON au.id = v.id
LEFT JOIN admins a ON au.id = a.id
WHERE au.email = 'salaamfoodpantry@gmail.com'; 