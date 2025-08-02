-- Fix database schema issues
-- Run this script in Supabase SQL editor

-- 1. Add missing accessibility_needs column to seniors table
ALTER TABLE seniors 
ADD COLUMN IF NOT EXISTS accessibility_needs TEXT;

-- 2. Ensure volunteers table has correct structure
CREATE TABLE IF NOT EXISTS volunteers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('volunteer', 'admin')) DEFAULT 'volunteer',
    profile_picture TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE
);

-- 3. Add RLS policies for volunteers table
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

-- Allow volunteers to read their own record
CREATE POLICY "Volunteers can read own record" ON volunteers
    FOR SELECT USING (auth.uid() = id);

-- Allow admins to read all volunteer records
CREATE POLICY "Admins can read all volunteers" ON volunteers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
        )
    );

-- Allow volunteers to update their own record
CREATE POLICY "Volunteers can update own record" ON volunteers
    FOR UPDATE USING (auth.uid() = id);

-- Allow admins to insert/update/delete volunteer records
CREATE POLICY "Admins can manage volunteers" ON volunteers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
        )
    );

-- 4. Fix user role for the specific user (change from admin to volunteer)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"volunteer"'
)
WHERE id = '2e4c6b4a-d2c1-40a0-8670-7dc7d74c4405';

-- 5. Ensure the user has a volunteer record
INSERT INTO volunteers (id, name, email, phone, role)
SELECT 
    '2e4c6b4a-d2c1-40a0-8670-7dc7d74c4405',
    COALESCE(raw_user_meta_data->>'name', 'Admin User'),
    email,
    raw_user_meta_data->>'phone',
    'volunteer'
FROM auth.users 
WHERE id = '2e4c6b4a-d2c1-40a0-8670-7dc7d74c4405'
ON CONFLICT (id) DO NOTHING;

-- 6. Add trigger to automatically create volunteer records on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO volunteers (id, name, email, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        'volunteer'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 