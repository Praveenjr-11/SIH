-- ====================================================================
-- LAND STACK Phase 6: Inter-Department Verification Schema
-- ====================================================================

-- 1. Create table case_department_verifications
CREATE TABLE IF NOT EXISTS case_department_verifications (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
  department VARCHAR(100) NOT NULL,
  verification_status VARCHAR(50) DEFAULT 'PENDING' CHECK (verification_status IN (
    'PENDING', 'IN_PROGRESS', 'VERIFIED', 'CONFLICT_FOUND', 'DOCUMENT_REQUIRED',
    'FIELD_INSPECTION_REQUIRED', 'SOURCE_UNAVAILABLE', 'ACCESS_RESTRICTED', 'NOT_APPLICABLE', 'REJECTED'
  )),
  verified_by_officer_id INTEGER REFERENCES officers(id),
  verified_at TIMESTAMPTZ,
  findings JSONB,
  evidence_ids JSONB,
  remarks TEXT,
  requires_further_review BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (case_id, department)
);

CREATE INDEX IF NOT EXISTS idx_case_dept_verif_case ON case_department_verifications (case_id);

-- 2. Expand status constraints for cases
-- First, attempt to drop the existing check constraint on cases.status if it exists
DO $$ 
DECLARE constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'cases'::regclass AND contype = 'c' AND conname LIKE '%status%';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE cases DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

-- Then add the new check constraint supporting the parallel workflow
ALTER TABLE cases ADD CONSTRAINT cases_status_check CHECK (status IN (
  'NEW', 'CASE_CREATED', 'PARCEL_IDENTIFIED', 
  'REVENUE_VERIFICATION', 'SURVEY_VERIFICATION', 'REGISTRATION_VERIFICATION', 
  'GOVERNMENT_LAND_CHECK', 'PLANNING_AND_CONSTRAINT_CHECK', 'FIELD_INSPECTION', 
  'CONSOLIDATED_REVIEW', 'OFFICER_RECOMMENDATION', 'CLARIFICATION_REQUIRED',
  'APPROVED', 'REJECTED', 'CLOSED',
  -- Keep old ones for backward compatibility
  'DOCUMENT_VERIFICATION', 'GIS_ANALYSIS', 'OFFICER_REVIEW', 'RECOMMENDATION'
));
