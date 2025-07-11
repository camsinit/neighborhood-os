-- Phase 1A: Add new enum values (must be separate transaction)

-- Add the new 'steward' and 'neighbor' roles to the enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'steward';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'neighbor';