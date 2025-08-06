-- Create function to get neighborhoods ready for weekly digest
CREATE OR REPLACE FUNCTION public.get_neighborhoods_ready_for_digest()
RETURNS TABLE(
  neighborhood_id uuid, 
  neighborhood_name text, 
  timezone text,
  last_sent timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    n.id as neighborhood_id,
    n.name as neighborhood_name,
    n.timezone,
    n.last_weekly_digest_sent as last_sent
  FROM neighborhoods n
  WHERE 
    -- It's Sunday morning (9 AM) in the neighborhood's timezone
    EXTRACT(dow FROM (NOW() AT TIME ZONE n.timezone)) = 0  -- Sunday
    AND EXTRACT(hour FROM (NOW() AT TIME ZONE n.timezone)) = 9  -- 9 AM
    AND (
      -- Either never sent, or last sent more than 6 days ago
      n.last_weekly_digest_sent IS NULL 
      OR n.last_weekly_digest_sent < (NOW() - INTERVAL '6 days')
    );
END;
$function$