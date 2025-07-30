-- Add building and unit_apt columns to seniors table
-- This script adds the missing columns needed for the Sequoia Commons data

-- Add building column
ALTER TABLE public.seniors 
ADD COLUMN IF NOT EXISTS building TEXT;

-- Add unit_apt column  
ALTER TABLE public.seniors 
ADD COLUMN IF NOT EXISTS unit_apt TEXT;

-- Add zip_code column for consistency
ALTER TABLE public.seniors 
ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'seniors' 
AND column_name IN ('building', 'unit_apt', 'zip_code')
ORDER BY column_name; 