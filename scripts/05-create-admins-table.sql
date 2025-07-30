-- Create admins table for admin user management
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin')),
    active BOOLEAN NOT NULL DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_active ON admins(active);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admins table

-- Policy: Users can read their own admin record
CREATE POLICY "Users can view own admin record" ON admins
    FOR SELECT USING (auth.uid() = id);

-- Policy: Super admins can read all admin records
CREATE POLICY "Super admins can view all admin records" ON admins
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Policy: Super admins can insert admin records
CREATE POLICY "Super admins can insert admin records" ON admins
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Policy: Super admins can update admin records
CREATE POLICY "Super admins can update admin records" ON admins
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Policy: Users can update their own last_login
CREATE POLICY "Users can update own last_login" ON admins
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Super admins can delete admin records
CREATE POLICY "Super admins can delete admin records" ON admins
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_admins_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW
    EXECUTE FUNCTION update_admins_updated_at();

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins 
        WHERE id = user_id AND active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins 
        WHERE id = user_id AND role = 'super_admin' AND active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's admin role
CREATE OR REPLACE FUNCTION get_admin_role(user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role FROM admins 
        WHERE id = user_id AND active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 