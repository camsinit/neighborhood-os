-- Clean up duplicate physical groups for neighborhood c0e4e442-74c1-4b34-8388-b19f7b1c6a5d
-- Keep only groups with exact matches to configured physical units

-- First, let's see what we're working with
DO $$
DECLARE
    group_record RECORD;
    configured_units TEXT[] := ARRAY['Ridgeway Ave', 'Terrace St', 'Gilbert St', 'Mather St'];
    neighborhood_uuid UUID := 'c0e4e442-74c1-4b34-8388-b19f7b1c6a5d';
BEGIN
    RAISE LOG 'Starting cleanup of duplicate physical groups for neighborhood %', neighborhood_uuid;
    
    -- Log all current groups
    FOR group_record IN 
        SELECT id, name, physical_unit_value 
        FROM groups 
        WHERE neighborhood_id = neighborhood_uuid 
          AND group_type = 'physical'
        ORDER BY physical_unit_value
    LOOP
        RAISE LOG 'Found group: % (%) - %', group_record.name, group_record.physical_unit_value, group_record.id;
    END LOOP;
    
    -- Delete groups that don't match configured units exactly
    DELETE FROM group_members 
    WHERE group_id IN (
        SELECT id FROM groups 
        WHERE neighborhood_id = neighborhood_uuid 
          AND group_type = 'physical'
          AND physical_unit_value IS NOT NULL
          AND physical_unit_value != ALL(configured_units)
    );
    
    DELETE FROM groups 
    WHERE neighborhood_id = neighborhood_uuid 
      AND group_type = 'physical'
      AND physical_unit_value IS NOT NULL
      AND physical_unit_value != ALL(configured_units);
    
    RAISE LOG 'Cleanup completed';
END $$;