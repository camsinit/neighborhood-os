-- Add column to track skills onboarding completion
ALTER TABLE public.profiles 
ADD COLUMN completed_skills_onboarding boolean DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.completed_skills_onboarding IS 'Tracks whether user has completed the skills-specific onboarding on the Skills page';