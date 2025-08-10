-- Ensure we're operating in the public schema
SET search_path TO public;

-- 1) Create/replace the AFTER INSERT trigger on events to create activities automatically
-- Drop if exists to keep migration idempotent
DROP TRIGGER IF EXISTS events_activity_trigger ON public.events;

-- Create the trigger to call public.create_activity() after new events are inserted
CREATE TRIGGER events_activity_trigger
AFTER INSERT ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.create_activity();

-- 2) Backfill missing activities for recent events (last 14 days)
-- We temporarily disable RLS on activities to allow system backfill, then re-enable it
DO $$
BEGIN
  -- Disable RLS only if enabled
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'activities' AND c.relrowsecurity
  ) THEN
    EXECUTE 'ALTER TABLE public.activities DISABLE ROW LEVEL SECURITY';
  END IF;

  -- Insert missing activity rows for events created in the last 14 days
  INSERT INTO public.activities (
    actor_id,
    activity_type,
    content_id,
    content_type,
    title,
    neighborhood_id,
    metadata,
    created_at
  )
  SELECT 
    e.host_id AS actor_id,
    'event_created'::activity_type AS activity_type,
    e.id AS content_id,
    'events' AS content_type,
    COALESCE(p.display_name, 'A neighbor') || ' created ' || e.title AS title,
    e.neighborhood_id,
    '{}'::jsonb AS metadata,
    COALESCE(e.created_at, now()) AS created_at
  FROM public.events e
  LEFT JOIN public.activities a
    ON a.content_id = e.id 
   AND a.content_type = 'events'
   AND a.activity_type = 'event_created'::activity_type
  LEFT JOIN public.profiles p ON p.id = e.host_id
  WHERE e.created_at > (now() - interval '14 days')
    AND a.id IS NULL;

  -- Re-enable RLS if it was enabled before
  IF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'activities' AND c.relrowsecurity
  ) THEN
    -- It was disabled above or wasn't enabled; ensure it's enabled now
    EXECUTE 'ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;
