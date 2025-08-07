# Salam Food Pantry Database Schema 

## Database Schema Overview

Salam Food Pantry app main tables:
- `seniors` - Senior citizen information with accessibility features
- `volunteers` - Volunteer and admin user data
- `admins` - Dedicated admin user management
- `deliveries` - Delivery tracking and status
- `senior_assignments` - Assignment of volunteers to seniors
- `admin_permissions` - Granular permission system
- `admin_role_permissions` - Role-based access control
- `admin_activity_log` - Audit trail for admin actions

## Complete SQL Scripts for Cursor

```sql
-- ADMIN MANAGEMENT SCRIPTS

-- Create Admin User Management Table
CREATE TABLE IF NOT EXISTS admins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  role text DEFAULT 'admin',
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  last_login timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now()
);

-- Admin Permission System
CREATE TABLE admin_permissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  permission_name text NOT NULL UNIQUE,
  description text,
  category text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default admin permissions
INSERT INTO admin_permissions (permission_name, description, category) VALUES
('manage_seniors', 'Add, edit, and delete senior records', 'senior_management'),
('manage_volunteers', 'Add, edit, and delete volunteer records', 'volunteer_management'),
('manage_deliveries', 'Assign and track deliveries', 'delivery_management'),
('view_reports', 'Access monthly and annual reports', 'reporting'),
('export_data', 'Export data as CSV/PDF', 'data_management'),
('import_data', 'Import data via CSV upload', 'data_management'),
('manage_admin_users', 'Create and manage other admin users', 'admin_management'),
('system_settings', 'Modify system configuration', 'system_management');

-- Role-Based Permission Management
CREATE TABLE admin_role_permissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  role text NOT NULL,
  permission_id uuid REFERENCES admin_permissions(id),
  granted_at timestamp with time zone DEFAULT now(),
  UNIQUE(role, permission_id)
);

-- Admin Activity Logging
CREATE TABLE admin_activity_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid REFERENCES volunteers(id),
  action text NOT NULL,
  target_table text,
  target_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- MAIN DATABASE SCHEMA

-- Seniors Table with Accessibility Features
CREATE TABLE public.seniors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER,
  household_type TEXT CHECK (household_type IN ('single', 'family')) DEFAULT 'single',
  family_adults INTEGER DEFAULT 1,
  family_children INTEGER DEFAULT 0,
  race_ethnicity TEXT,
  health_conditions TEXT,
  address TEXT NOT NULL,
  building TEXT,
  unit_apt TEXT,
  zip_code TEXT,
  dietary_restrictions TEXT,
  phone TEXT,
  emergency_contact TEXT,
  has_smartphone BOOLEAN DEFAULT false,
  preferred_language TEXT DEFAULT 'english',
  needs_translation BOOLEAN DEFAULT false,
  delivery_method TEXT CHECK (delivery_method IN ('doorstep', 'phone_confirmed', 'family_member')) DEFAULT 'doorstep',
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- Volunteers Table with Language Capabilities
CREATE TABLE public.volunteers (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT CHECK (role IN ('volunteer', 'admin', 'super_admin')) DEFAULT 'volunteer',
  speaks_languages TEXT[] DEFAULT ARRAY['english'],
  profile_picture TEXT,
  permissions jsonb DEFAULT '{}',
  last_login timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- Deliveries Table with Enhanced Tracking
CREATE TABLE public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id UUID NOT NULL REFERENCES public.seniors(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  delivery_date DATE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'delivered', 'missed', 'no_contact', 'family_confirmed')) DEFAULT 'pending',
  delivery_method TEXT CHECK (delivery_method IN ('doorstep', 'phone_confirmed', 'family_member')),
  notes TEXT,
  language_barrier_encountered BOOLEAN DEFAULT false,
  translation_needed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Senior Assignments Table
CREATE TABLE public.senior_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id UUID NOT NULL REFERENCES public.seniors(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  assigned_by UUID,
  assignment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('active', 'inactive', 'completed')) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ADMIN FUNCTIONS

-- Permission Check Function
CREATE OR REPLACE FUNCTION user_has_permission(permission_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM volunteers WHERE id = auth.uid();
  
  RETURN EXISTS (
    SELECT 1 
    FROM admin_role_permissions arp
    JOIN admin_permissions ap ON arp.permission_id = ap.id
    WHERE arp.role = user_role
    AND ap.permission_name = permission_name
  );
END;
$$;

-- Admin User Creation Function
CREATE OR REPLACE FUNCTION create_admin_user(
  user_email text,
  user_name text,
  user_phone text DEFAULT null,
  admin_role text DEFAULT 'admin'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM volunteers 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Only super admins can create admin users';
  END IF;

  new_user_id := gen_random_uuid();
  
  INSERT INTO volunteers (id, email, name, phone, role, active)
  VALUES (new_user_id, user_email, user_name, user_phone, admin_role, true);
  
  INSERT INTO admin_activity_log (admin_id, action, target_table, target_id)
  VALUES (auth.uid(), 'CREATE_ADMIN_USER', 'volunteers', new_user_id);
  
  RETURN new_user_id;
END;
$$;

-- Admin Dashboard Statistics View
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM seniors WHERE active = true) as total_seniors,
  (SELECT COUNT(*) FROM volunteers WHERE active = true) as total_volunteers,
  (SELECT COUNT(*) FROM deliveries WHERE status = 'completed' AND DATE_TRUNC('month', delivery_date) = DATE_TRUNC('month', CURRENT_DATE)) as monthly_deliveries,
  (SELECT COUNT(*) FROM deliveries WHERE status = 'pending') as pending_deliveries,
  (SELECT COUNT(*) FROM volunteers WHERE role IN ('admin', 'super_admin')) as total_admins;

-- ROW LEVEL SECURITY POLICIES

-- Enable RLS
ALTER TABLE public.seniors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.senior_assignments ENABLE ROW LEVEL SECURITY;

-- Simple, Non-Recursive Policies
CREATE POLICY "volunteers_can_view_own_record" ON volunteers
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "admins_can_manage_all_volunteers" ON volunteers
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM volunteers 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "volunteers_can_read_seniors" ON seniors
  FOR SELECT USING (true);

CREATE POLICY "admins_can_manage_seniors" ON seniors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM volunteers 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- SAMPLE DATA

-- Sample Seniors (Sequoia Commons residents)
INSERT INTO seniors (name, address, building, unit_apt, zip_code, active) VALUES
('Lakkeen Wong', '40789 Fremont Blvd, Unit 101, Fremont, CA 94538', 'Sequoia Commons', '101', '94538', true),
('Jasmine Chen', '40789 Fremont Blvd, Unit 102, Fremont, CA 94538', 'Sequoia Commons', '102', '94538', true),
('Victor Lau', '40789 Fremont Blvd, Unit 110, Fremont, CA 94538', 'Sequoia Commons', '110', '94538', true),
-- ... (additional 29 seniors as shown in your data)
('Elena', '40789 Fremont Blvd, Fremont, CA 94538', 'Sequoia Commons', NULL, '94538', true),
('Gerny', '40789 Fremont Blvd, Fremont, CA 94538', 'Sequoia Commons', NULL, '94538', true);

-- Admin Setup
UPDATE volunteers SET role = 'super_admin' WHERE email = 'salaamfoodpantry@gmail.com';

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_seniors_active ON public.seniors(active);
CREATE INDEX idx_seniors_language ON public.seniors(preferred_language);
CREATE INDEX idx_seniors_smartphone ON public.seniors(has_smartphone);
CREATE INDEX idx_volunteers_active ON public.volunteers(active);
CREATE INDEX idx_volunteers_languages ON public.volunteers USING GIN(speaks_languages);
CREATE INDEX idx_deliveries_date ON public.deliveries(delivery_date);
CREATE INDEX idx_deliveries_status ON public.deliveries(status);
CREATE INDEX idx_deliveries_senior ON public.deliveries(senior_id);
CREATE INDEX idx_deliveries_volunteer ON public.deliveries(volunteer_id);
CREATE INDEX idx_senior_assignments_senior ON public.senior_assignments(senior_id);
CREATE INDEX idx_senior_assignments_volunteer ON public.senior_assignments(volunteer_id);
```

## Known Issues to Address

Key issues in your database:

1. **RLS Policy Recursion**: Some policies reference the same table they're protecting
2. **Missing Updated_At Columns**: Some tables lack `updated_at` fields causing trigger errors
3. **Admin Role Recognition**: Frontend not properly reading admin roles from database
4. **Client-Side Exceptions**: Navigation issues likely due to missing data or improper async handling

Analyze the provided Salam Food Pantry database schema and identify issues causing:
1. Admin functions not appearing in frontend despite correct database roles
2. Client-side exceptions during navigation
3. RLS policy conflicts and infinite recursion errors
4. Missing database columns causing trigger failures
5. Authentication state not syncing with admin/volunteer tables

Focus on fixing the integration between the database schema above and the Next.js frontend, ensuring proper role-based access control and mobile responsiveness.
