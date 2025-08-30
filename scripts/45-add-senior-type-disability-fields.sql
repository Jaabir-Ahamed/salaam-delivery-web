-- Add new fields to seniors table for enhanced senior categorization
-- Script: 45-add-senior-type-disability-fields.sql

-- Add senior_type field to track senior living situation
ALTER TABLE public.seniors 
ADD COLUMN IF NOT EXISTS senior_type TEXT;

-- Add disability field to track accessibility needs
ALTER TABLE public.seniors 
ADD COLUMN IF NOT EXISTS disability TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.seniors.senior_type IS 'Type of senior living situation (Veterans, Independent, Assisted Living, etc.)';
COMMENT ON COLUMN public.seniors.disability IS 'Type of disability if any (Mobility, Vision, Hearing, Cognitive, etc.)';

-- Update existing records to have default values
UPDATE public.seniors 
SET senior_type = 'Independent' 
WHERE senior_type IS NULL;

UPDATE public.seniors 
SET disability = 'None' 
WHERE disability IS NULL;

-- Make the fields NOT NULL after setting defaults
ALTER TABLE public.seniors 
ALTER COLUMN senior_type SET NOT NULL;

ALTER TABLE public.seniors 
ALTER COLUMN disability SET NOT NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'seniors' 
AND column_name IN ('senior_type', 'disability');

-- Show sample of updated data
SELECT id, name, senior_type, disability 
FROM public.seniors 
LIMIT 5;
