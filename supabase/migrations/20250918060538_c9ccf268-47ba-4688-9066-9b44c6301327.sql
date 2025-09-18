-- Add title field to group_updates table
ALTER TABLE public.group_updates 
ADD COLUMN title TEXT;

-- Update existing group_updates to have a default title based on content
UPDATE public.group_updates 
SET title = CASE 
  WHEN LENGTH(content) > 25 THEN LEFT(content, 22) || '...'
  ELSE content
END
WHERE title IS NULL;

-- Make title NOT NULL after setting defaults
ALTER TABLE public.group_updates 
ALTER COLUMN title SET NOT NULL;

-- Add constraint to limit title length
ALTER TABLE public.group_updates 
ADD CONSTRAINT group_updates_title_length CHECK (LENGTH(title) <= 25);

-- Update trigger to maintain updated_at
CREATE OR REPLACE FUNCTION public.update_group_updates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS trigger_update_group_updates_updated_at ON public.group_updates;
CREATE TRIGGER trigger_update_group_updates_updated_at
  BEFORE UPDATE ON public.group_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_group_updates_updated_at();