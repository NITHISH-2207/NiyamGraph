-- ==============================================================================
-- NiyamGraph AICTE Officer Roles and Demo Accounts Migration (PostgreSQL / Neon)
-- ==============================================================================
-- Purpose:
--   Creates four distinct AICTE officer roles and provisions demo accounts.
--   Preserves existing users, password hashes, and primary keys.
-- ==============================================================================

BEGIN;

-- 1. Ensure Distinct AICTE Officer Roles Exist
INSERT INTO roles (id, name, description, created_at)
VALUES
    (gen_random_uuid(), 'AICTE Scrutiny Officer', 'Scrutiny Officer with institutional application evaluation and deficiency notice authority', NOW()),
    (gen_random_uuid(), 'AICTE EVC Officer', 'Expert Visit Committee Officer with inspection panel coordination and report verification authority', NOW()),
    (gen_random_uuid(), 'AICTE Regional Officer', 'Regional Officer with jurisdiction application management and escalation oversight', NOW()),
    (gen_random_uuid(), 'AICTE Complaints Officer', 'Grievance and Compliance Officer with institutional complaint investigation and resolution authority', NOW())
ON CONFLICT (name) DO NOTHING;

-- 2. Update existing scrutiny officer account if present under legacy email or official name
UPDATE users
SET email = 'test.official@aicte.gov.in',
    full_name = 'Dr. K. N. Rao',
    is_active = TRUE,
    failed_login_attempts = 0,
    locked_until = NULL,
    updated_at = NOW()
WHERE email IN ('test.official@aicte.gov.in', 'official@niyamgraph.example');

-- 3. Link Scrutiny Officer Role to Dr. K. N. Rao (test.official@aicte.gov.in)
INSERT INTO user_roles (id, user_id, role_id, created_at)
SELECT gen_random_uuid(), u.id, r.id, NOW()
FROM users u, roles r
WHERE u.email = 'test.official@aicte.gov.in'
  AND r.name = 'AICTE Scrutiny Officer'
  AND NOT EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- 4. Create missing demo accounts if absent
-- Password hash below corresponds to Argon2id of "YourTestPassword123!"
-- u1: EVC Officer (test.evc@aicte.gov.in)
INSERT INTO users (id, email, full_name, password_hash, is_active, failed_login_attempts, must_change_password, created_at, updated_at)
SELECT gen_random_uuid(), 'test.evc@aicte.gov.in', 'Prof. M. S. Sundaram',
       '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQxMjM0NTY3OA$9v5aN7/oI3Hqj1xZ8u2dYh4K2X9+6l1p7Z3v8q0m1kQ',
       TRUE, 0, FALSE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'test.evc@aicte.gov.in');

INSERT INTO user_roles (id, user_id, role_id, created_at)
SELECT gen_random_uuid(), u.id, r.id, NOW()
FROM users u, roles r
WHERE u.email = 'test.evc@aicte.gov.in'
  AND r.name = 'AICTE EVC Officer'
  AND NOT EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- u2: Regional Officer (test.regional@aicte.gov.in)
INSERT INTO users (id, email, full_name, password_hash, is_active, failed_login_attempts, must_change_password, created_at, updated_at)
SELECT gen_random_uuid(), 'test.regional@aicte.gov.in', 'Dr. S. K. Verma',
       '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQxMjM0NTY3OA$9v5aN7/oI3Hqj1xZ8u2dYh4K2X9+6l1p7Z3v8q0m1kQ',
       TRUE, 0, FALSE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'test.regional@aicte.gov.in');

INSERT INTO user_roles (id, user_id, role_id, created_at)
SELECT gen_random_uuid(), u.id, r.id, NOW()
FROM users u, roles r
WHERE u.email = 'test.regional@aicte.gov.in'
  AND r.name = 'AICTE Regional Officer'
  AND NOT EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- u3: Complaints Officer (test.complaints@aicte.gov.in)
INSERT INTO users (id, email, full_name, password_hash, is_active, failed_login_attempts, must_change_password, created_at, updated_at)
SELECT gen_random_uuid(), 'test.complaints@aicte.gov.in', 'Smt. Radha Iyer',
       '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQxMjM0NTY3OA$9v5aN7/oI3Hqj1xZ8u2dYh4K2X9+6l1p7Z3v8q0m1kQ',
       TRUE, 0, FALSE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'test.complaints@aicte.gov.in');

INSERT INTO user_roles (id, user_id, role_id, created_at)
SELECT gen_random_uuid(), u.id, r.id, NOW()
FROM users u, roles r
WHERE u.email = 'test.complaints@aicte.gov.in'
  AND r.name = 'AICTE Complaints Officer'
  AND NOT EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

COMMIT;

