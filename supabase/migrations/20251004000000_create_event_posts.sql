-- Create event_posts table for event discussions
CREATE TABLE IF NOT EXISTS public.event_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT event_posts_title_length CHECK (char_length(title) > 0 AND char_length(title) <= 100),
  CONSTRAINT event_posts_content_length CHECK (char_length(content) > 0 AND char_length(content) <= 2000)
);

-- Create index for faster lookups by event
CREATE INDEX idx_event_posts_event_id ON public.event_posts(event_id);
CREATE INDEX idx_event_posts_created_at ON public.event_posts(created_at DESC);

-- Enable RLS
ALTER TABLE public.event_posts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view posts for events in their neighborhood
CREATE POLICY "Users can view event posts in their neighborhood"
ON public.event_posts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events e
    JOIN neighborhood_members nm ON nm.neighborhood_id = e.neighborhood_id
    WHERE e.id = event_posts.event_id
    AND nm.user_id = auth.uid()
  )
);

-- Only event host and attendees can create posts
CREATE POLICY "Event hosts and attendees can create posts"
ON public.event_posts
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (
    -- User is the event host
    EXISTS (
      SELECT 1 FROM events
      WHERE id = event_posts.event_id
      AND host_id = auth.uid()
    )
    OR
    -- User has RSVP'd to the event
    EXISTS (
      SELECT 1 FROM event_rsvps
      WHERE event_id = event_posts.event_id
      AND user_id = auth.uid()
    )
  )
);

-- Users can update their own posts
CREATE POLICY "Users can update their own event posts"
ON public.event_posts
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own posts
CREATE POLICY "Users can delete their own event posts"
ON public.event_posts
FOR DELETE
USING (user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_event_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_event_posts_updated_at
BEFORE UPDATE ON public.event_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_event_posts_updated_at();

-- Create notification function for new event posts
CREATE OR REPLACE FUNCTION public.create_event_post_notification()
RETURNS TRIGGER AS $$
DECLARE
  event_title TEXT;
  post_author_name TEXT;
  recipient_record RECORD;
  log_id TEXT;
BEGIN
  -- Generate a transaction ID for logging
  log_id := 'EVENT_POST_' || substr(md5(random()::text), 1, 8);

  RAISE LOG '[create_event_post_notification] [%] Creating notifications for event post: %',
    log_id, NEW.id;

  -- Get the event title
  SELECT title INTO event_title
  FROM events
  WHERE id = NEW.event_id;

  -- Get the post author's display name
  SELECT display_name INTO post_author_name
  FROM profiles
  WHERE id = NEW.user_id;

  -- Create notifications for all event attendees and the host (except the post author)
  FOR recipient_record IN
    -- Get all RSVP'd users
    SELECT DISTINCT er.user_id
    FROM event_rsvps er
    WHERE er.event_id = NEW.event_id
    AND er.user_id != NEW.user_id

    UNION

    -- Get the event host
    SELECT e.host_id as user_id
    FROM events e
    WHERE e.id = NEW.event_id
    AND e.host_id != NEW.user_id
  LOOP
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      link,
      related_id,
      action_type,
      created_at
    ) VALUES (
      recipient_record.user_id,
      'event',
      'New post in ' || event_title,
      post_author_name || ' posted: ' || NEW.title,
      '/events/' || NEW.event_id,
      NEW.event_id,
      'view',
      now()
    );

    RAISE LOG '[create_event_post_notification] [%] Created notification for user: %',
      log_id, recipient_record.user_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for event post notifications
CREATE TRIGGER event_post_notification_trigger
AFTER INSERT ON public.event_posts
FOR EACH ROW
EXECUTE FUNCTION public.create_event_post_notification();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_posts TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
