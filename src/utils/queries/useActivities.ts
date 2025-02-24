
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

// Create an interface for our Activity type
export interface Activity {
  id: string;
  created_at: string;
  actor_id: string;
  activity_type: string;
  content_id: string;
  content_type: string;
  title: string;
  metadata: Json; // Update to use the Json type from Supabase
  profiles: {
    display_name: string;
    avatar_url: string;
  };
}

const fetchActivities = async (): Promise<Activity[]> => {
  // Fetch activities and join with profiles to get actor information
  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      profiles:actor_id (
        display_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }

  return data || [];
};

export const useActivities = () => {
  return useQuery({
    queryKey: ["activities"],
    queryFn: fetchActivities,
  });
};
