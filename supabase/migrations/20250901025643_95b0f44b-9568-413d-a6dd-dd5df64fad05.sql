-- Add physical unit assignment to neighborhood members
-- This allows residents to be assigned to physical units during invitation

ALTER TABLE neighborhood_members 
ADD COLUMN IF NOT EXISTS physical_unit_value text;

-- Add index for better query performance when filtering by physical unit
CREATE INDEX IF NOT EXISTS idx_neighborhood_members_physical_unit 
ON neighborhood_members(neighborhood_id, physical_unit_value) 
WHERE physical_unit_value IS NOT NULL;

-- Add a comment explaining the column
COMMENT ON COLUMN neighborhood_members.physical_unit_value IS 
'The physical unit (street, floor, block, etc.) that this resident is assigned to within their neighborhood';