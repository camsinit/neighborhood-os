-- Physical Units Configuration for Neighborhoods
-- Add this to your Supabase SQL Editor

-- Add physical unit configuration columns to neighborhoods table
ALTER TABLE neighborhoods 
ADD COLUMN IF NOT EXISTS physical_unit_type text 
  CHECK (physical_unit_type IN ('street', 'floor', 'block', 'custom')),
ADD COLUMN IF NOT EXISTS physical_unit_label text,
ADD COLUMN IF NOT EXISTS physical_units jsonb DEFAULT '[]'::jsonb;

-- Update existing neighborhoods with default values (streets as most common)
UPDATE neighborhoods 
SET 
  physical_unit_type = 'street',
  physical_unit_label = 'Streets',
  physical_units = '[]'::jsonb
WHERE physical_unit_type IS NULL;

-- Make physical_unit_type NOT NULL after setting defaults
ALTER TABLE neighborhoods 
ALTER COLUMN physical_unit_type SET NOT NULL;