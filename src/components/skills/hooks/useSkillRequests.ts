
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SkillWithProfile } from "../types/skillTypes";

/**
 * Custom hook to fetch and manage skill requests data
 * @param isDrawerOpen - Boolean to control if all requests should be fetched
 * @returns Object containing skill requests data and loading states
 */
export const useSkillRequests = (isDrawerOpen: boolean = false) => {
  // Query for recent requests (limited to 5)
  const { data: requests, isLoading } = useQuery({
    queryKey: ['skill-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills_exchange')
        .select(`
          *,
          profiles:user_id (
            avatar_url,
            display_name
          )
        `)
        .eq('request_type', 'need')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      return data as SkillWithProfile[];
    }
  });

  // Query for all requests (used in drawer)
  const { data: allRequests, isLoading: isLoadingAll } = useQuery({
    queryKey: ['all-skill-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills_exchange')
        .select(`
          *,
          profiles:user_id (
            avatar_url,
            display_name
          )
        `)
        .eq('request_type', 'need')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as SkillWithProfile[];
    },
    enabled: isDrawerOpen // Only fetch when drawer is open
  });

  return {
    requests,
    allRequests,
    isLoading,
    isLoadingAll
  };
};
