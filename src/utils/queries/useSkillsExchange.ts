
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Custom hook for fetching skills exchange data with enhanced error logging
 */
export const useSkillsExchange = () => {
  return useQuery({
    queryKey: ['skills-exchange'],
    queryFn: async () => {
      // Log the query attempt with timestamp
      console.log('[useSkillsExchange] Fetching skills exchange data', {
        timestamp: new Date().toISOString()
      });

      try {
        const { data, error } = await supabase
          .from('skills_exchange')
          .select(`
            *,
            profiles (
              id,
              display_name,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          // Enhanced error logging
          console.error('[useSkillsExchange] Error fetching skills exchange:', {
            error: {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            },
            timestamp: new Date().toISOString()
          });
          throw error;
        }

        // Log the returned data count
        console.log('[useSkillsExchange] Skills exchange data fetched successfully:', {
          count: data?.length || 0,
          timestamp: new Date().toISOString()
        });
        
        return data;
      } catch (error) {
        // Catch and log any unexpected errors
        console.error('[useSkillsExchange] Unexpected error in skills fetch:', error);
        throw error;
      }
    },
    // Add retry configuration for intermittent network issues
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};
