-- Create group_updates table for announcements, photos, and text posts
CREATE TABLE public.group_updates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  image_urls text[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  edited_by uuid,
  is_deleted boolean NOT NULL DEFAULT false
);

-- Create group_update_comments table for threaded discussions
CREATE TABLE public.group_update_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  update_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  edited_by uuid,
  is_deleted boolean NOT NULL DEFAULT false
);

-- Create group_update_reactions table for emoji reactions
CREATE TABLE public.group_update_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  update_id uuid,
  comment_id uuid,
  user_id uuid NOT NULL,
  emoji text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT group_update_reactions_content_check CHECK (
    (update_id IS NOT NULL AND comment_id IS NULL) OR 
    (update_id IS NULL AND comment_id IS NOT NULL)
  ),
  UNIQUE(update_id, user_id, emoji),
  UNIQUE(comment_id, user_id, emoji)
);

-- Enable RLS on all tables
ALTER TABLE public.group_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_update_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_update_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for group_updates
CREATE POLICY "Group members can view updates"
ON public.group_updates FOR SELECT
USING (is_group_member(auth.uid(), group_id) AND NOT is_deleted);

CREATE POLICY "Group members can create updates"
ON public.group_updates FOR INSERT
WITH CHECK (is_group_member(auth.uid(), group_id) AND auth.uid() = user_id);

CREATE POLICY "Group members can update their own updates"
ON public.group_updates FOR UPDATE
USING (is_group_member(auth.uid(), group_id) AND auth.uid() = user_id);

CREATE POLICY "Group managers can update any update"
ON public.group_updates FOR UPDATE
USING (is_group_manager(auth.uid(), group_id));

-- RLS policies for group_update_comments
CREATE POLICY "Group members can view comments"
ON public.group_update_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_updates gu 
    WHERE gu.id = update_id AND is_group_member(auth.uid(), gu.group_id)
  ) AND NOT is_deleted
);

CREATE POLICY "Group members can create comments"
ON public.group_update_comments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_updates gu 
    WHERE gu.id = update_id AND is_group_member(auth.uid(), gu.group_id)
  ) AND auth.uid() = user_id
);

CREATE POLICY "Group members can update their own comments"
ON public.group_update_comments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM group_updates gu 
    WHERE gu.id = update_id AND is_group_member(auth.uid(), gu.group_id)
  ) AND auth.uid() = user_id
);

CREATE POLICY "Group managers can update any comment"
ON public.group_update_comments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM group_updates gu 
    WHERE gu.id = update_id AND is_group_manager(auth.uid(), gu.group_id)
  )
);

-- RLS policies for group_update_reactions
CREATE POLICY "Group members can view reactions"
ON public.group_update_reactions FOR SELECT
USING (
  (update_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM group_updates gu 
    WHERE gu.id = update_id AND is_group_member(auth.uid(), gu.group_id)
  )) OR
  (comment_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM group_update_comments guc
    JOIN group_updates gu ON gu.id = guc.update_id
    WHERE guc.id = comment_id AND is_group_member(auth.uid(), gu.group_id)
  ))
);

CREATE POLICY "Group members can manage their own reactions"
ON public.group_update_reactions FOR ALL
USING (
  auth.uid() = user_id AND (
    (update_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM group_updates gu 
      WHERE gu.id = update_id AND is_group_member(auth.uid(), gu.group_id)
    )) OR
    (comment_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM group_update_comments guc
      JOIN group_updates gu ON gu.id = guc.update_id
      WHERE guc.id = comment_id AND is_group_member(auth.uid(), gu.group_id)
    ))
  )
);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_group_updates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_group_updates_updated_at
  BEFORE UPDATE ON public.group_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_group_updates_updated_at();

CREATE TRIGGER update_group_update_comments_updated_at
  BEFORE UPDATE ON public.group_update_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_group_updates_updated_at();