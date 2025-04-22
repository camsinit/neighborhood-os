
import { supabase } from "@/integrations/supabase/client";

export const fetchUserProfiles = async (userIds: string[]) => {
  if (!userIds.length) return { data: [] };

  return supabase
    .from("profiles")
    .select('id, display_name, avatar_url')
    .in('id', userIds);
};
