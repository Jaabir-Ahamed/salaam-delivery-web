-- Comprehensive duplicate cleanup for seniors table
-- This script will identify and remove ALL types of duplicates

-- First, let's see the current state
SELECT 
  'CURRENT STATE' as info,
  COUNT(*) as total_seniors
FROM seniors;

-- Check for duplicates by name only
SELECT 
  'DUPLICATES BY NAME ONLY' as info,
  COUNT(*) as duplicate_groups
FROM (
  SELECT name, COUNT(*) as count
  FROM seniors 
  GROUP BY name
  HAVING COUNT(*) > 1
) name_duplicates;

-- Check for duplicates by address only
SELECT 
  'DUPLICATES BY ADDRESS ONLY' as info,
  COUNT(*) as duplicate_groups
FROM (
  SELECT address, COUNT(*) as count
  FROM seniors 
  GROUP BY address
  HAVING COUNT(*) > 1
) address_duplicates;

-- Check for duplicates by name + address
SELECT 
  'DUPLICATES BY NAME + ADDRESS' as info,
  COUNT(*) as duplicate_groups
FROM (
  SELECT name, address, COUNT(*) as count
  FROM seniors 
  GROUP BY name, address
  HAVING COUNT(*) > 1
) name_address_duplicates;

-- Show all duplicate groups by name + address
WITH duplicate_groups AS (
  SELECT 
    name,
    address,
    COUNT(*) as count,
    MIN(created_at) as oldest,
    MAX(created_at) as newest,
    STRING_AGG(id::text, ', ' ORDER BY created_at DESC) as all_ids
  FROM seniors 
  GROUP BY name, address
  HAVING COUNT(*) > 1
)
SELECT 
  name,
  address,
  count as duplicate_count,
  oldest,
  newest,
  all_ids
FROM duplicate_groups
ORDER BY count DESC, name;

-- Now remove duplicates by name + address, keeping the newest
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

-- Check if we still have duplicates by name only (different addresses)
WITH name_duplicates AS (
  SELECT 
    name,
    COUNT(*) as count,
    STRING_AGG(address, ' | ' ORDER BY created_at DESC) as all_addresses
  FROM seniors 
  GROUP BY name
  HAVING COUNT(*) > 1
)
SELECT 
  'REMAINING DUPLICATES BY NAME' as info,
  COUNT(*) as duplicate_groups
FROM name_duplicates;

-- Show remaining duplicates by name
WITH name_duplicates AS (
  SELECT 
    name,
    COUNT(*) as count,
    STRING_AGG(address, ' | ' ORDER BY created_at DESC) as all_addresses,
    STRING_AGG(id::text, ', ' ORDER BY created_at DESC) as all_ids
  FROM seniors 
  GROUP BY name
  HAVING COUNT(*) > 1
)
SELECT 
  name,
  count as duplicate_count,
  all_addresses,
  all_ids
FROM name_duplicates
ORDER BY count DESC, name;

-- Remove duplicates by name only, keeping the one with the most complete data
-- (preferring non-null addresses, then newest)
WITH name_duplicates AS (
  SELECT 
    id,
    name,
    address,
    created_at,
    CASE 
      WHEN address IS NOT NULL AND address != '' THEN 1 
      ELSE 0 
    END as has_address,
    ROW_NUMBER() OVER (
      PARTITION BY name 
      ORDER BY 
        CASE WHEN address IS NOT NULL AND address != '' THEN 1 ELSE 0 END DESC,
        created_at DESC
    ) as rn
  FROM seniors
)
DELETE FROM seniors 
WHERE id IN (
  SELECT id 
  FROM name_duplicates 
  WHERE rn > 1
);

-- Final verification
SELECT 
  'FINAL STATE' as info,
  COUNT(*) as total_seniors_remaining
FROM seniors;

-- Check for any remaining duplicates
WITH final_check AS (
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
  END as final_status
FROM final_check;

-- Show final sample of data
SELECT 
  id,
  name,
  address,
  building,
  unit_apt,
  created_at,
  active
FROM seniors 
ORDER BY created_at DESC
LIMIT 20; 