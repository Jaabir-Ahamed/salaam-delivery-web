-- Remove duplicate seniors from the database
-- This script identifies duplicates and keeps the newest ones based on creation date

-- First, let's see what duplicates we have
WITH duplicate_check AS (
  SELECT 
    name,
    address,
    COUNT(*) as count,
    MIN(created_at) as oldest_created,
    MAX(created_at) as newest_created
  FROM seniors 
  GROUP BY name, address
  HAVING COUNT(*) > 1
)
SELECT 
  'DUPLICATE ANALYSIS' as info,
  COUNT(*) as total_duplicate_groups,
  SUM(count) as total_duplicate_records
FROM duplicate_check;

-- Show the duplicate groups
WITH duplicate_check AS (
  SELECT 
    name,
    address,
    COUNT(*) as count,
    MIN(created_at) as oldest_created,
    MAX(created_at) as newest_created
  FROM seniors 
  GROUP BY name, address
  HAVING COUNT(*) > 1
)
SELECT 
  name,
  address,
  count as duplicate_count,
  oldest_created,
  newest_created
FROM duplicate_check
ORDER BY count DESC, name;

-- Now remove the duplicates, keeping only the newest record for each name+address combination
WITH duplicates_to_remove AS (
  SELECT 
    id,
    name,
    address,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY name, address 
      ORDER BY created_at DESC
    ) as rn
  FROM seniors
)
DELETE FROM seniors 
WHERE id IN (
  SELECT id 
  FROM duplicates_to_remove 
  WHERE rn > 1
);

-- Verify the cleanup
SELECT 
  'AFTER CLEANUP' as info,
  COUNT(*) as total_seniors_remaining
FROM seniors;

-- Check if any duplicates remain
WITH duplicate_check AS (
  SELECT 
    name,
    address,
    COUNT(*) as count
  FROM seniors 
  GROUP BY name, address
  HAVING COUNT(*) > 1
)
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN 'No duplicates remaining'
    ELSE 'WARNING: ' || COUNT(*) || ' duplicate groups still exist'
  END as duplicate_status
FROM duplicate_check;

-- Show a sample of remaining seniors
SELECT 
  name,
  address,
  building,
  unit_apt,
  created_at,
  active
FROM seniors 
ORDER BY created_at DESC
LIMIT 20; 