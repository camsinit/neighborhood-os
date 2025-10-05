-- Update Notification Preferences for Granular Email Controls
-- This migration adds individual email toggles for each notification type
-- organized by Personal Notifications and Neighborhood Activity

-- Update the notification_preferences structure to support granular email controls
-- New structure:
-- {
--   "email": {
--     "personal": {
--       "events": {
--         "event_rsvp": true,
--         "group_event_invitation": true
--       },
--       "skills": {
--         "skill_session_request": true,
--         "skill_session_cancelled": true
--       },
--       "groups": {
--         "group_member_joined": true,
--         "group_update_comment": true,
--         "group_invitation": true
--       }
--     },
--     "neighborhood": {
--       "events": {
--         "event_created": true
--       },
--       "skills": {
--         "skill_offered": true,
--         "skill_requested": true
--       },
--       "groups": {
--         "group_update_posted": true,
--         "group_event_created": true
--       },
--       "neighbors": {
--         "neighbor_joined": true
--       }
--     },
--     "weekly_summary": true
--   }
-- }

-- Update existing users to have the new granular email structure
UPDATE profiles
SET notification_preferences = jsonb_build_object(
  'email', jsonb_build_object(
    'personal', jsonb_build_object(
      'events', jsonb_build_object(
        'event_rsvp', true,
        'group_event_invitation', true
      ),
      'skills', jsonb_build_object(
        'skill_session_request', true,
        'skill_session_cancelled', true
      ),
      'groups', jsonb_build_object(
        'group_member_joined', true,
        'group_update_comment', true,
        'group_invitation', true
      )
    ),
    'neighborhood', jsonb_build_object(
      'events', jsonb_build_object(
        'event_created', true
      ),
      'skills', jsonb_build_object(
        'skill_offered', true,
        'skill_requested', true
      ),
      'groups', jsonb_build_object(
        'group_update_posted', true,
        'group_event_created', true
      ),
      'neighbors', jsonb_build_object(
        'neighbor_joined', true
      )
    ),
    'weekly_summary', true
  )
)
WHERE notification_preferences IS NOT NULL;

-- Update the default notification_preferences for new users
ALTER TABLE profiles
ALTER COLUMN notification_preferences
SET DEFAULT jsonb_build_object(
  'email', jsonb_build_object(
    'personal', jsonb_build_object(
      'events', jsonb_build_object(
        'event_rsvp', true,
        'group_event_invitation', true
      ),
      'skills', jsonb_build_object(
        'skill_session_request', true,
        'skill_session_cancelled', true
      ),
      'groups', jsonb_build_object(
        'group_member_joined', true,
        'group_update_comment', true,
        'group_invitation', true
      )
    ),
    'neighborhood', jsonb_build_object(
      'events', jsonb_build_object(
        'event_created', true
      ),
      'skills', jsonb_build_object(
        'skill_offered', true,
        'skill_requested', true
      ),
      'groups', jsonb_build_object(
        'group_update_posted', true,
        'group_event_created', true
      ),
      'neighbors', jsonb_build_object(
        'neighbor_joined', true
      )
    ),
    'weekly_summary', true
  )
);

-- Update handle_new_user function to use new structure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Create profile with proper notification preferences enabled by default
  INSERT INTO profiles (
    id,
    notification_preferences
  )
  VALUES (
    new.id,
    jsonb_build_object(
      'email', jsonb_build_object(
        'personal', jsonb_build_object(
          'events', jsonb_build_object(
            'event_rsvp', true,
            'group_event_invitation', true
          ),
          'skills', jsonb_build_object(
            'skill_session_request', true,
            'skill_session_cancelled', true
          ),
          'groups', jsonb_build_object(
            'group_member_joined', true,
            'group_update_comment', true,
            'group_invitation', true
          )
        ),
        'neighborhood', jsonb_build_object(
          'events', jsonb_build_object(
            'event_created', true
          ),
          'skills', jsonb_build_object(
            'skill_offered', true,
            'skill_requested', true
          ),
          'groups', jsonb_build_object(
            'group_update_posted', true,
            'group_event_created', true
          ),
          'neighbors', jsonb_build_object(
            'neighbor_joined', true
          )
        ),
        'weekly_summary', true
      )
    )
  );

  -- Create user role
  INSERT INTO user_roles (user_id, role)
  VALUES (new.id, 'user');

  RETURN new;
END;
$$;

-- Update should_user_receive_email_notification function for new structure
CREATE OR REPLACE FUNCTION should_user_receive_email_notification(
  p_user_id UUID,
  p_notification_type TEXT,
  p_content_type TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_prefs JSONB;
  type_enabled BOOLEAN;
  category TEXT;
  page TEXT;
BEGIN
  -- Get user's notification preferences
  SELECT notification_preferences INTO user_prefs
  FROM profiles
  WHERE id = p_user_id;

  -- If no preferences found, default to true
  IF user_prefs IS NULL THEN
    RETURN true;
  END IF;

  -- Handle weekly_summary separately
  IF p_notification_type = 'weekly_summary' THEN
    type_enabled := COALESCE(
      (user_prefs->'email'->>'weekly_summary')::boolean,
      true
    );
    RETURN type_enabled;
  END IF;

  -- Determine category (personal or neighborhood) and page based on notification type
  -- Personal notifications
  IF p_notification_type IN ('event_rsvp', 'group_event_invitation') THEN
    category := 'personal';
    page := 'events';
  ELSIF p_notification_type IN ('skill_session_request', 'skill_session_cancelled') THEN
    category := 'personal';
    page := 'skills';
  ELSIF p_notification_type IN ('group_member_joined', 'group_update_comment', 'group_invitation') THEN
    category := 'personal';
    page := 'groups';
  -- Neighborhood activity notifications
  ELSIF p_notification_type = 'event_created' THEN
    category := 'neighborhood';
    page := 'events';
  ELSIF p_notification_type IN ('skill_offered', 'skill_requested') THEN
    category := 'neighborhood';
    page := 'skills';
  ELSIF p_notification_type IN ('group_update_posted', 'group_event_created') THEN
    category := 'neighborhood';
    page := 'groups';
  ELSIF p_notification_type = 'neighbor_joined' THEN
    category := 'neighborhood';
    page := 'neighbors';
  ELSE
    -- Unknown notification type, default to false
    RETURN false;
  END IF;

  -- Check if the specific notification type is enabled
  type_enabled := COALESCE(
    (user_prefs->'email'->category->page->>p_notification_type)::boolean,
    true  -- Default to enabled if not set
  );

  RETURN type_enabled;
END;
$$;

-- Log the update
DO $$
BEGIN
  RAISE NOTICE 'Updated notification preferences to support granular email controls';
  RAISE NOTICE 'Each notification type now has individual email toggle settings';
END $$;
