-- ==============================================================================
-- NiyamGraph Safe & Idempotent Database Update Script (PostgreSQL / Neon)
-- ==============================================================================
-- Purpose:
--   Renames legacy development-prefixed (TEST-) institutions and users
--   to natural, clean demonstration identities.
--
-- Guarantees:
--   1. Fully transactional (wrapped in BEGIN / COMMIT).
--   2. Preserves primary keys (UUIDs) and all foreign-key relationships.
--   3. Preserves password hashes and existing credentials.
--   4. Idempotent: Can be run multiple times safely.
-- ==============================================================================

BEGIN;

-- 1. Update Institution 1 (Apex Institute of Technology & Management)
UPDATE institutions
SET identifier = 'TEST-PID-1-93821094',
    official_name = 'Apex Institute of Technology & Management',
    official_email = 'contact@apex.edu.in',
    verification_status = 'Self-Declared (Demo)',
    updated_at = NOW()
WHERE identifier IN ('TEST-PID-1-93821094', '1-93821094', 'TEST-PID-1-93821094')
   OR official_name = 'TEST - Apex Institute of Technology & Management';

-- 2. Update Institution 2 (Bharat Polytechnic & Engineering Academy)
UPDATE institutions
SET identifier = 'NG-BHARAT-0002',
    official_name = 'Bharat Polytechnic & Engineering Academy',
    official_email = 'contact@bharat.edu.in',
    verification_status = 'Self-Declared (Demo)',
    updated_at = NOW()
WHERE identifier IN ('TEST-PID-2-45891234', '2-45891234', 'NG-BHARAT-0002')
   OR official_name = 'TEST - Bharat Polytechnic & Engineering Academy';

-- 3. Update Apex Administrator User Account
UPDATE users
SET email = 'test.admin@apex.edu.in',
    full_name = 'Prof. Ananya Sen',
    failed_login_attempts = 0,
    locked_until = NULL,
    updated_at = NOW()
WHERE email IN ('test.test.admin@apex.edu.in', 'test.admin@apex.edu.in');

-- 4. Update Apex Staff User Account
UPDATE users
SET email = 'staff@apex.edu.in',
    full_name = 'Dr. Rajesh Verma',
    failed_login_attempts = 0,
    locked_until = NULL,
    updated_at = NOW()
WHERE email IN ('test.staff@apex.edu.in', 'staff@apex.edu.in');

-- 5. Update Bharat Administrator User Account
UPDATE users
SET email = 'admin@bharat.edu.in',
    full_name = 'Prof. Vikram Rao',
    failed_login_attempts = 0,
    locked_until = NULL,
    updated_at = NOW()
WHERE email IN ('test.admin@bharat.edu.in', 'admin@bharat.edu.in');

-- 6. Update AICTE Official User Account
UPDATE users
SET email = 'official@niyamgraph.example',
    full_name = 'Dr. K. N. Rao',
    failed_login_attempts = 0,
    locked_until = NULL,
    updated_at = NOW()
WHERE email IN ('test.official@aicte.gov.in', 'official@niyamgraph.example');

COMMIT;

