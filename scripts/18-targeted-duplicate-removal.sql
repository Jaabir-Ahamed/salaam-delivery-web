-- Targeted duplicate removal for Sequoia Commons seniors
-- This script removes the old 40798 records and keeps only the new 40789 records

-- First, let's see what we have
SELECT 
  'CURRENT STATE' as info,
  COUNT(*) as total_seniors,
  COUNT(CASE WHEN address LIKE '%40789%' THEN 1 END) as sequoia_commons_40789,
  COUNT(CASE WHEN address LIKE '%40798%' THEN 1 END) as old_40798_records
FROM seniors;

-- Show the specific duplicates we need to remove
SELECT 
  name,
  address,
  building,
  unit_apt,
  created_at,
  active
FROM seniors 
WHERE name IN (
  SELECT name 
  FROM seniors 
  GROUP BY name 
  HAVING COUNT(*) > 1
)
ORDER BY name, created_at DESC;

-- Remove the old 40798 records, keeping only the new 40789 records
DELETE FROM seniors 
WHERE address LIKE '%40798%';

-- Verify the cleanup
SELECT 
  'AFTER REMOVING 40798 RECORDS' as info,
  COUNT(*) as total_seniors_remaining,
  COUNT(CASE WHEN address LIKE '%40789%' THEN 1 END) as sequoia_commons_40789,
  COUNT(CASE WHEN address LIKE '%40798%' THEN 1 END) as old_40798_records
FROM seniors;

-- Check for any remaining duplicates by name
WITH name_duplicates AS (
  SELECT 
    name,
    COUNT(*) as count
  FROM seniors 
  GROUP BY name
  HAVING COUNT(*) > 1
)
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN 'SUCCESS: No duplicates remaining'
    ELSE 'WARNING: ' || COUNT(*) || ' duplicate groups still exist'
  END as duplicate_status
FROM name_duplicates;

-- Show final result
SELECT 
  name,
  address,
  building,
  unit_apt,
  created_at,
  active
FROM seniors 
ORDER BY name, created_at DESC
LIMIT 30; 