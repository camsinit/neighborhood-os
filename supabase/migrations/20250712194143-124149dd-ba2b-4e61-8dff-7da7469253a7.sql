-- Add years_lived_here column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN years_lived_here INTEGER;

-- Add a comment to document the column
COMMENT ON COLUMN public.profiles.years_lived_here IS 'Number of years the user has lived in their current area';