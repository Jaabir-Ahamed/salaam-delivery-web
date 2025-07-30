-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create seniors table with accessibility features
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

-- Create volunteers table with language capabilities
CREATE TABLE public.volunteers (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT CHECK (role IN ('volunteer', 'admin')) DEFAULT 'volunteer',
  speaks_languages TEXT[] DEFAULT ARRAY['english'],
  profile_picture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- Create deliveries table with enhanced tracking
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

-- Create profile pictures storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX idx_seniors_active ON public.seniors(active);
CREATE INDEX idx_seniors_language ON public.seniors(preferred_language);
CREATE INDEX idx_seniors_smartphone ON public.seniors(has_smartphone);
CREATE INDEX idx_volunteers_active ON public.volunteers(active);
CREATE INDEX idx_volunteers_languages ON public.volunteers USING GIN(speaks_languages);
CREATE INDEX idx_deliveries_date ON public.deliveries(delivery_date);
CREATE INDEX idx_deliveries_status ON public.deliveries(status);
CREATE INDEX idx_deliveries_senior ON public.deliveries(senior_id);
CREATE INDEX idx_deliveries_volunteer ON public.deliveries(volunteer_id);
