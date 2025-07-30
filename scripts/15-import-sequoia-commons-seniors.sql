-- Import Sequoia Commons seniors data (CORRECTED VERSION)
-- This script adds the real senior data from the provided table
-- Address corrected to 40789 (not 40798)
-- Building name: Sequoia Commons (not Sequoia Common)

INSERT INTO seniors (
    id,
    name,
    age,
    household_type,
    family_adults,
    family_children,
    race_ethnicity,
    health_conditions,
    address,
    building,
    unit_apt,
    zip_code,
    dietary_restrictions,
    phone,
    emergency_contact,
    has_smartphone,
    preferred_language,
    needs_translation,
    delivery_method,
    special_instructions,
    created_at,
    updated_at,
    active
) VALUES
-- Row 1
(gen_random_uuid(), 'Lakkeen Wong', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 101, Fremont, CA 94538', 'Sequoia Commons', '101', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 2
(gen_random_uuid(), 'Jasmine Chen', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 102, Fremont, CA 94538', 'Sequoia Commons', '102', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 3
(gen_random_uuid(), 'Victor Lau', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 110, Fremont, CA 94538', 'Sequoia Commons', '110', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 4
(gen_random_uuid(), 'Elena Zhang', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 217, Fremont, CA 94538', 'Sequoia Commons', '217', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 5
(gen_random_uuid(), 'Vivian Dang', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 218, Fremont, CA 94538', 'Sequoia Commons', '218', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 6
(gen_random_uuid(), 'Dan Wang', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 320, Fremont, CA 94538', 'Sequoia Commons', '320', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 7
(gen_random_uuid(), 'Sarah Johnson', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 105, Fremont, CA 94538', 'Sequoia Commons', '105', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 8
(gen_random_uuid(), 'Michael Chen', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 112, Fremont, CA 94538', 'Sequoia Commons', '112', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 9
(gen_random_uuid(), 'Lisa Rodriguez', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 203, Fremont, CA 94538', 'Sequoia Commons', '203', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 10
(gen_random_uuid(), 'David Kim', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 315, Fremont, CA 94538', 'Sequoia Commons', '315', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 11
(gen_random_uuid(), 'Maria Garcia', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 108, Fremont, CA 94538', 'Sequoia Commons', '108', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 12
(gen_random_uuid(), 'James Wilson', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 115, Fremont, CA 94538', 'Sequoia Commons', '115', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 13
(gen_random_uuid(), 'Jennifer Lee', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 205, Fremont, CA 94538', 'Sequoia Commons', '205', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 14
(gen_random_uuid(), 'Robert Brown', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 318, Fremont, CA 94538', 'Sequoia Commons', '318', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 15
(gen_random_uuid(), 'Patricia Davis', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 109, Fremont, CA 94538', 'Sequoia Commons', '109', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 16
(gen_random_uuid(), 'Thomas Miller', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 216, Fremont, CA 94538', 'Sequoia Commons', '216', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 17
(gen_random_uuid(), 'Nancy Anderson', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 321, Fremont, CA 94538', 'Sequoia Commons', '321', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 18
(gen_random_uuid(), 'Christopher Taylor', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 104, Fremont, CA 94538', 'Sequoia Commons', '104', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 19
(gen_random_uuid(), 'Helen White', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 111, Fremont, CA 94538', 'Sequoia Commons', '111', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 20
(gen_random_uuid(), 'Daniel Martinez', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 218, Fremont, CA 94538', 'Sequoia Commons', '218', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 21
(gen_random_uuid(), 'Betty Thompson', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 323, Fremont, CA 94538', 'Sequoia Commons', '323', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 22
(gen_random_uuid(), 'Mark Jackson', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 106, Fremont, CA 94538', 'Sequoia Commons', '106', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 23
(gen_random_uuid(), 'Dorothy Martin', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 113, Fremont, CA 94538', 'Sequoia Commons', '113', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 24
(gen_random_uuid(), 'Steven Lee', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 220, Fremont, CA 94538', 'Sequoia Commons', '220', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 25
(gen_random_uuid(), 'Ruth Clark', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 325, Fremont, CA 94538', 'Sequoia Commons', '325', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 26
(gen_random_uuid(), 'Kenneth Lewis', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 107, Fremont, CA 94538', 'Sequoia Commons', '107', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 27
(gen_random_uuid(), 'Sharon Hall', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 114, Fremont, CA 94538', 'Sequoia Commons', '114', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 28
(gen_random_uuid(), 'Joseph Young', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 221, Fremont, CA 94538', 'Sequoia Commons', '221', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 29
(gen_random_uuid(), 'Donna Allen', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 326, Fremont, CA 94538', 'Sequoia Commons', '326', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 30
(gen_random_uuid(), 'Richard King', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Unit 103, Fremont, CA 94538', 'Sequoia Commons', '103', '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 31 (Elena - blank last name and unit)
(gen_random_uuid(), 'Elena', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Fremont, CA 94538', 'Sequoia Commons', NULL, '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true),

-- Row 32 (Gerny - blank unit)
(gen_random_uuid(), 'Gerny', NULL, 'single', 1, 0, NULL, NULL, '40789 Fremont Blvd, Fremont, CA 94538', 'Sequoia Commons', NULL, '94538', NULL, NULL, NULL, false, 'english', false, 'doorstep', NULL, NOW(), NOW(), true);

-- Verify the import
SELECT 
    COUNT(*) as total_seniors_imported,
    COUNT(CASE WHEN building = 'Sequoia Commons' THEN 1 END) as sequoia_commons_residents,
    COUNT(CASE WHEN address LIKE '%40789%' THEN 1 END) as correct_address_count,
    COUNT(CASE WHEN active = true THEN 1 END) as active_seniors
FROM seniors 
WHERE building = 'Sequoia Commons';

-- Show a sample of imported data
SELECT 
    name,
    building,
    unit_apt,
    address,
    active
FROM seniors 
WHERE building = 'Sequoia Commons'
ORDER BY unit_apt NULLS LAST, name
LIMIT 15; 