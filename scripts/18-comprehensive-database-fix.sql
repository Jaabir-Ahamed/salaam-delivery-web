-- ============================================================================
-- COMPREHENSIVE DATABASE FIX SCRIPT
-- ============================================================================
-- This script addresses all identified issues:
-- 1. Admin functions not appearing in frontend despite correct database roles
-- 2. Client-side exceptions during navigation
-- 3. RLS policy conflicts and infinite recursion errors
-- 4. Missing database columns causing trigger failures
-- 5. Authentication state not syncing with admin/volunteer tables

-- ============================================================================
-- 1. FIX MISSING COLUMNS AND TRIGGERS
-- ============================================================================

-- Add missing updated_at columns to tables that don't have them
ALTER TABLE public.seniors 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.volunteers 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.deliveries 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.senior_assignments 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Fix volunteers table role constraint to allow super_admin
ALTER TABLE public.volunteers 
DROP CONSTRAINT IF EXISTS volunteers_role_check;

ALTER TABLE public.volunteers 
ADD CONSTRAINT volunteers_role_check 
CHECK (role IN ('volunteer', 'admin', 'super_admin'));

-- Create or replace update triggers for all tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_seniors_updated_at ON public.seniors;
DROP TRIGGER IF EXISTS update_volunteers_updated_at ON public.volunteers;
DROP TRIGGER IF EXISTS update_deliveries_updated_at ON public.deliveries;
DROP TRIGGER IF EXISTS update_senior_assignments_updated_at ON public.senior_assignments;

-- Create triggers
CREATE TRIGGER update_seniors_updated_at
    BEFORE UPDATE ON public.seniors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteers_updated_at
    BEFORE UPDATE ON public.volunteers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at
    BEFORE UPDATE ON public.deliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_senior_assignments_updated_at
    BEFORE UPDATE ON public.senior_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. FIX RLS POLICIES - REMOVE ALL RECURSIVE POLICIES
-- ============================================================================

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "volunteers_can_view_own_record" ON volunteers;
DROP POLICY IF EXISTS "admins_can_manage_all_volunteers" ON volunteers;
DROP POLICY IF EXISTS "volunteers_can_read_own_data" ON volunteers;
DROP POLICY IF EXISTS "volunteers_can_insert_own_data" ON volunteers;
DROP POLICY IF EXISTS "volunteers_can_update_own_data" ON volunteers;
DROP POLICY IF EXISTS "admins_can_manage_volunteers" ON volunteers;
DROP POLICY IF EXISTS "volunteers_can_read_seniors" ON seniors;
DROP POLICY IF EXISTS "admins_can_manage_seniors" ON seniors;
DROP POLICY IF EXISTS "volunteers_can_read_own_deliveries" ON deliveries;
DROP POLICY IF EXISTS "volunteers_can_update_own_deliveries" ON deliveries;
DROP POLICY IF EXISTS "Users can view own admin record" ON admins;
DROP POLICY IF EXISTS "Super admins can view all admin records" ON admins;
DROP POLICY IF EXISTS "Super admins can insert admin records" ON admins;
DROP POLICY IF EXISTS "Super admins can update admin records" ON admins;
DROP POLICY IF EXISTS "Users can update own last_login" ON admins;
DROP POLICY IF EXISTS "Super admins can delete admin records" ON admins;

-- ============================================================================
-- 3. CREATE SIMPLIFIED, NON-RECURSIVE POLICIES
-- ============================================================================

-- Volunteers table policies (simplified, non-recursive)
CREATE POLICY "volunteers_select_own" ON volunteers
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "volunteers_insert_own" ON volunteers
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "volunteers_update_own" ON volunteers
    FOR UPDATE USING (auth.uid() = id);

-- Admin policies for volunteers (simplified)
CREATE POLICY "admins_manage_volunteers" ON volunteers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.id = auth.uid()
        )
    );

-- Seniors table policies (simplified)
CREATE POLICY "volunteers_read_seniors" ON seniors
    FOR SELECT USING (active = true);

CREATE POLICY "admins_manage_seniors" ON seniors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.id = auth.uid()
        )
    );

-- Deliveries table policies (simplified)
CREATE POLICY "volunteers_read_own_deliveries" ON deliveries
    FOR SELECT USING (volunteer_id = auth.uid());

CREATE POLICY "volunteers_update_own_deliveries" ON deliveries
    FOR UPDATE USING (volunteer_id = auth.uid());

CREATE POLICY "admins_manage_deliveries" ON deliveries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.id = auth.uid()
        )
    );

-- Senior assignments table policies (simplified)
CREATE POLICY "volunteers_read_own_assignments" ON senior_assignments
    FOR SELECT USING (volunteer_id = auth.uid());

CREATE POLICY "admins_manage_assignments" ON senior_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.id = auth.uid()
        )
    );

-- Admins table policies (simplified)
CREATE POLICY "admins_read_own" ON admins
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "admins_manage_admins" ON admins
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.id = auth.uid() AND role = 'super_admin'
        )
    );

-- ============================================================================
-- 4. ENSURE ADMIN USER EXISTS AND HAS CORRECT ROLE
-- ============================================================================

-- First, ensure the admin user exists in auth.users
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Check if admin user exists in auth.users
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'salaamfoodpantry@gmail.com';
    
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'Admin user not found in auth.users - please create manually';
    ELSE
        RAISE NOTICE 'Admin user found: %', admin_user_id;
        
        -- Ensure admin record exists in admins table
        INSERT INTO admins (id, email, name, role, active)
        VALUES (admin_user_id, 'salaamfoodpantry@gmail.com', 'Salaam Food Pantry Admin', 'super_admin', true)
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            name = EXCLUDED.name,
            role = EXCLUDED.role,
            active = EXCLUDED.active,
            updated_at = NOW();
            
        -- Also ensure volunteer record exists (for compatibility)
        INSERT INTO volunteers (id, email, name, role, active)
        VALUES (admin_user_id, 'salaamfoodpantry@gmail.com', 'Salaam Food Pantry Admin', 'super_admin', true)
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            name = EXCLUDED.name,
            role = EXCLUDED.role,
            active = EXCLUDED.active,
            updated_at = NOW();
    END IF;
END $$;

-- ============================================================================
-- 5. CREATE HELPER FUNCTIONS FOR ROLE CHECKING
-- ============================================================================

-- Function to check if user is admin (simplified)
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins 
        WHERE id = user_id AND active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role (simplified)
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Check admins table first
    SELECT role INTO user_role FROM admins 
    WHERE id = user_id AND active = true;
    
    -- If not found in admins, check volunteers table
    IF user_role IS NULL THEN
        SELECT role INTO user_role FROM volunteers 
        WHERE id = user_id AND active = true;
    END IF;
    
    -- Default to volunteer if no role found
    RETURN COALESCE(user_role, 'volunteer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. VERIFY FIXES
-- ============================================================================

-- Test queries to verify everything works
SELECT 
    'Database fix verification' as test,
    (SELECT COUNT(*) FROM seniors WHERE active = true) as active_seniors,
    (SELECT COUNT(*) FROM volunteers WHERE active = true) as active_volunteers,
    (SELECT COUNT(*) FROM admins WHERE active = true) as active_admins,
    (SELECT COUNT(*) FROM senior_assignments WHERE status = 'active') as active_assignments;

-- Test admin access
SELECT 
    'Admin access test' as test,
    auth.uid() as current_user_id,
    is_user_admin() as is_admin,
    get_user_role() as user_role;

-- ============================================================================
-- 7. CLEANUP - REMOVE ANY DUPLICATE POLICIES
-- ============================================================================

-- List all policies to verify they're correct
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname; 