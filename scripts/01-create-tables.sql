-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create seniors table
CREATE TABLE seniors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  household_type TEXT NOT NULL CHECK (household_type IN ('single', 'family')),
  family_adults INTEGER DEFAULT 1,
  family_children INTEGER DEFAULT 0,
  race_ethnicity TEXT,
  health_conditions TEXT,
  address TEXT NOT NULL,
  dietary_restrictions TEXT,
  phone TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- Create volunteers table (linked to Supabase Auth)
CREATE TABLE volunteers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('volunteer', 'admin')),
  profile_picture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- Create deliveries table with corrected schema
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  senior_id UUID NOT NULL REFERENCES seniors(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  delivery_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'delivered', 'missed')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create profile pictures storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-pictures', 'profile-pictures', true);

-- Create indexes for better performance
CREATE INDEX idx_deliveries_date ON deliveries(delivery_date);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_senior ON deliveries(senior_id);
CREATE INDEX idx_deliveries_volunteer ON deliveries(volunteer_id);
CREATE INDEX idx_seniors_active ON seniors(active);
CREATE INDEX idx_volunteers_active ON volunteers(active);
CREATE INDEX idx_volunteers_email ON volunteers(email);
