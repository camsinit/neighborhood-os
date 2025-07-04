-- Create enum for content types that can be shared
CREATE TYPE public.shareable_content_type AS ENUM ('events', 'safety', 'skills', 'goods');

-- Create shared_items table to track shared links
CREATE TABLE public.shared_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type shareable_content_type NOT NULL,
  content_id UUID NOT NULL,
  neighborhood_id UUID NOT NULL,
  share_code TEXT NOT NULL UNIQUE,
  shared_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  view_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create indexes for efficient querying
CREATE INDEX idx_shared_items_share_code ON public.shared_items(share_code);
CREATE INDEX idx_shared_items_content ON public.shared_items(content_type, content_id);
CREATE INDEX idx_shared_items_expiry ON public.shared_items(expires_at) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE public.shared_items ENABLE ROW LEVEL SECURITY;

-- Create policies for shared_items
-- Anyone can view active, non-expired shared items (for public share links)
CREATE POLICY "Allow public access to active shared items" 
  ON public.shared_items 
  FOR SELECT 
  USING (is_active = true AND expires_at > now());

-- Users can create shares for content in their neighborhoods
CREATE POLICY "Users can create shares in their neighborhoods" 
  ON public.shared_items 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = shared_by AND 
    is_user_in_neighborhood(auth.uid(), neighborhood_id)
  );

-- Users can view and update their own shares
CREATE POLICY "Users can manage their own shares" 
  ON public.shared_items 
  FOR ALL 
  USING (auth.uid() = shared_by);

-- Function to generate unique share codes
CREATE OR REPLACE FUNCTION public.generate_share_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  -- Generate 12-character random string
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM shared_items WHERE share_code = result) LOOP
    result := '';
    FOR i IN 1..12 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;