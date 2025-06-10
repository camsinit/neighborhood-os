
-- Create a table to store waitlist survey responses
CREATE TABLE public.waitlist_survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  neighborhood_name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  neighbors_to_onboard INTEGER NOT NULL DEFAULT 0,
  ai_coding_experience TEXT NOT NULL,
  open_source_interest TEXT NOT NULL,
  priority_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key relationship to waitlist table via email
ALTER TABLE public.waitlist_survey_responses 
ADD CONSTRAINT fk_waitlist_email 
FOREIGN KEY (email) REFERENCES public.waitlist(email) ON DELETE CASCADE;

-- Create index for efficient querying by email and priority
CREATE INDEX idx_waitlist_survey_email ON public.waitlist_survey_responses(email);
CREATE INDEX idx_waitlist_survey_priority ON public.waitlist_survey_responses(priority_score DESC);
CREATE INDEX idx_waitlist_survey_city_state ON public.waitlist_survey_responses(city, state);

-- Add Row Level Security (though this will be publicly readable for admin purposes)
ALTER TABLE public.waitlist_survey_responses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (for admin dashboard in future)
CREATE POLICY "Allow public read access to survey responses" 
  ON public.waitlist_survey_responses 
  FOR SELECT 
  USING (true);

-- Create policy to allow public insert (since users aren't authenticated when filling survey)
CREATE POLICY "Allow public insert for survey responses" 
  ON public.waitlist_survey_responses 
  FOR INSERT 
  WITH CHECK (true);

-- Create a function to calculate priority score based on survey responses
CREATE OR REPLACE FUNCTION public.calculate_priority_score(
  neighbors_count INTEGER,
  ai_experience TEXT,
  open_source TEXT
) RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Base score for neighbor count (more neighbors = higher priority)
  score := score + LEAST(neighbors_count * 2, 20); -- Cap at 20 points
  
  -- AI coding experience scoring
  CASE ai_experience
    WHEN 'Expert' THEN score := score + 15;
    WHEN 'Advanced' THEN score := score + 12;
    WHEN 'Intermediate' THEN score := score + 8;
    WHEN 'Beginner' THEN score := score + 5;
    WHEN 'None' THEN score := score + 0;
    ELSE score := score + 0;
  END CASE;
  
  -- Open source interest scoring
  CASE open_source
    WHEN 'Very Interested' THEN score := score + 10;
    WHEN 'Interested' THEN score := score + 7;
    WHEN 'Somewhat Interested' THEN score := score + 4;
    WHEN 'Not Very Interested' THEN score := score + 2;
    WHEN 'Not Interested' THEN score := score + 0;
    ELSE score := score + 0;
  END CASE;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically calculate priority score on insert/update
CREATE OR REPLACE FUNCTION public.update_priority_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.priority_score := public.calculate_priority_score(
    NEW.neighbors_to_onboard,
    NEW.ai_coding_experience,
    NEW.open_source_interest
  );
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_priority_score
  BEFORE INSERT OR UPDATE ON public.waitlist_survey_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_priority_score();
