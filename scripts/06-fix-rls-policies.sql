-- Fix RLS policies to allow admin user creation and email confirmation handling

-- Drop existing policies that are causing issues
DROP POLICY IF EXISTS "volunteers_can_insert_own_data" ON public.volunteers;
DROP POLICY IF EXISTS "admins_can_manage_volunteers" ON public.volunteers;

-- Create a more permissive policy for volunteer record creation
-- This allows the system to create volunteer records during signup
CREATE POLICY "volunteers_can_insert_own_data" ON public.volunteers
  FOR INSERT WITH CHECK (
    auth.uid() = id OR
    (auth.jwt() ->> 'email') = 'salaamfoodpantry@gmail.com' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Update admin policy to be more permissive for the admin email
CREATE POLICY "admins_can_manage_volunteers" ON public.volunteers
  FOR ALL USING (
    (auth.jwt() ->> 'email') = 'salaamfoodpantry@gmail.com' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() AND active = true
    )
  );

-- Add a policy to allow service role operations (for admin user creation)
CREATE POLICY "service_role_can_manage_volunteers" ON public.volunteers
  FOR ALL USING (
    auth.role() = 'service_role'
  );

-- Also fix the seniors and deliveries policies to use the admins table
DROP POLICY IF EXISTS "admins_can_manage_seniors" ON public.seniors;
DROP POLICY IF EXISTS "admins_can_manage_deliveries" ON public.deliveries;

CREATE POLICY "admins_can_manage_seniors" ON public.seniors
  FOR ALL USING (
    (auth.jwt() ->> 'email') = 'salaamfoodpantry@gmail.com' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() AND active = true
    )
  );

CREATE POLICY "admins_can_manage_deliveries" ON public.deliveries
  FOR ALL USING (
    (auth.jwt() ->> 'email') = 'salaamfoodpantry@gmail.com' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() AND active = true
    )
  ); 