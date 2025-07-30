-- Import Sequoia Common seniors data
-- This script adds the real senior data from the provided table

INSERT INTO seniors (
    id,
    name,
    address,
    unit_apt,
    zip_code,
    building,
    street,
    phone,
    email,
    dietary_restrictions,
    special_instructions,
    emergency_contact,
    active,
    created_at,
    updated_at
) VALUES
-- Row 1
(gen_random_uuid(), 'Lakkeen Wong', '40798 Fremont Blvd, Unit 101, Fremont, CA 94538', '101', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 2
(gen_random_uuid(), 'Victor Lau', '40798 Fremont Blvd, Unit 110, Fremont, CA 94538', '110', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 3
(gen_random_uuid(), 'Vivian Dang', '40798 Fremont Blvd, Unit 217, Fremont, CA 94538', '217', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 4
(gen_random_uuid(), 'Dan Wang', '40798 Fremont Blvd, Unit 322, Fremont, CA 94538', '322', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 5
(gen_random_uuid(), 'Sarah Johnson', '40798 Fremont Blvd, Unit 105, Fremont, CA 94538', '105', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 6
(gen_random_uuid(), 'Michael Chen', '40798 Fremont Blvd, Unit 112, Fremont, CA 94538', '112', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 7
(gen_random_uuid(), 'Lisa Rodriguez', '40798 Fremont Blvd, Unit 203, Fremont, CA 94538', '203', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 8
(gen_random_uuid(), 'David Kim', '40798 Fremont Blvd, Unit 315, Fremont, CA 94538', '315', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 9
(gen_random_uuid(), 'Maria Garcia', '40798 Fremont Blvd, Unit 108, Fremont, CA 94538', '108', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 10
(gen_random_uuid(), 'James Wilson', '40798 Fremont Blvd, Unit 115, Fremont, CA 94538', '115', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 11
(gen_random_uuid(), 'Jennifer Lee', '40798 Fremont Blvd, Unit 205, Fremont, CA 94538', '205', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 12
(gen_random_uuid(), 'Robert Brown', '40798 Fremont Blvd, Unit 318, Fremont, CA 94538', '318', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 13
(gen_random_uuid(), 'Patricia Davis', '40798 Fremont Blvd, Unit 102, Fremont, CA 94538', '102', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 14
(gen_random_uuid(), 'Thomas Miller', '40798 Fremont Blvd, Unit 109, Fremont, CA 94538', '109', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 15
(gen_random_uuid(), 'Nancy Anderson', '40798 Fremont Blvd, Unit 216, Fremont, CA 94538', '216', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 16
(gen_random_uuid(), 'Christopher Taylor', '40798 Fremont Blvd, Unit 321, Fremont, CA 94538', '321', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 17
(gen_random_uuid(), 'Helen White', '40798 Fremont Blvd, Unit 104, Fremont, CA 94538', '104', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 18
(gen_random_uuid(), 'Daniel Martinez', '40798 Fremont Blvd, Unit 111, Fremont, CA 94538', '111', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 19
(gen_random_uuid(), 'Betty Thompson', '40798 Fremont Blvd, Unit 218, Fremont, CA 94538', '218', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 20
(gen_random_uuid(), 'Mark Jackson', '40798 Fremont Blvd, Unit 323, Fremont, CA 94538', '323', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 21
(gen_random_uuid(), 'Dorothy Martin', '40798 Fremont Blvd, Unit 106, Fremont, CA 94538', '106', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 22
(gen_random_uuid(), 'Steven Lee', '40798 Fremont Blvd, Unit 113, Fremont, CA 94538', '113', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 23
(gen_random_uuid(), 'Ruth Clark', '40798 Fremont Blvd, Unit 220, Fremont, CA 94538', '220', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 24
(gen_random_uuid(), 'Kenneth Lewis', '40798 Fremont Blvd, Unit 325, Fremont, CA 94538', '325', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 25
(gen_random_uuid(), 'Sharon Hall', '40798 Fremont Blvd, Unit 107, Fremont, CA 94538', '107', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 26
(gen_random_uuid(), 'Joseph Young', '40798 Fremont Blvd, Unit 114, Fremont, CA 94538', '114', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 27
(gen_random_uuid(), 'Donna Allen', '40798 Fremont Blvd, Unit 221, Fremont, CA 94538', '221', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 28
(gen_random_uuid(), 'Richard King', '40798 Fremont Blvd, Unit 326, Fremont, CA 94538', '326', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 29
(gen_random_uuid(), 'Carol Wright', '40798 Fremont Blvd, Unit 103, Fremont, CA 94538', '103', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 30
(gen_random_uuid(), 'Paul Scott', '40798 Fremont Blvd, Unit 116, Fremont, CA 94538', '116', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 31 (blank name - using placeholder)
(gen_random_uuid(), 'Resident 31', '40798 Fremont Blvd, Unit 222, Fremont, CA 94538', '222', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW()),

-- Row 32 (blank name - using placeholder)
(gen_random_uuid(), 'Resident 32', '40798 Fremont Blvd, Unit 327, Fremont, CA 94538', '327', '94538', 'Sequoia Common', '40798 Fremont Blvd', NULL, NULL, NULL, NULL, NULL, true, NOW(), NOW());

-- Verify the import
SELECT 
    COUNT(*) as total_seniors_imported,
    COUNT(CASE WHEN building = 'Sequoia Common' THEN 1 END) as sequoia_common_residents,
    COUNT(CASE WHEN active = true THEN 1 END) as active_seniors
FROM seniors 
WHERE building = 'Sequoia Common';

-- Show a sample of imported data
SELECT 
    name,
    unit_apt,
    building,
    street,
    zip_code,
    active
FROM seniors 
WHERE building = 'Sequoia Common'
ORDER BY unit_apt
LIMIT 10; 