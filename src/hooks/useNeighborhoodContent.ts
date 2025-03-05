
/**
 * useNeighborhoodContent Hook
 * 
 * This hook provides access to all content (events, goods, safety updates, etc.)
 * from the current neighborhood using the neighborhood_content view.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNeighborhood } from './useNeighborhood';

// Define the content item type
export interface NeighborhoodContentItem {
  content_type: 'event' | 'goods' | 'safety' | 'skill';
  content_id: string;
  title: string;
  description: string | null;
  created_at: string;
  neighborhood_id: string;
  user_id: string;
}

/**
 * Custom hook to fetch all content from the current neighborhood
 * 
 * This provides a unified way to access all neighborhood content
 * which can be useful for activity feeds or search functionality.
 */
export function useNeighborhoodContent() {
  // Get the current neighborhood
  const { neighborhood, isLoading: isLoadingNeighborhood } = useNeighborhood();
  
  // Query to fetch neighborhood content
  return useQuery({
    queryKey: ['neighborhood-content', neighborhood?.id],
    queryFn: async () => {
      if (!neighborhood?.id) {
        console.log("[useNeighborhoodContent] No neighborhood found, skipping content fetch");
        return [];
      }
      
      try {
        // Fetch content using the view we created
        const { data, error } = await supabase
          .from('neighborhood_content')
          .select('*')
          .eq('neighborhood_id', neighborhood.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("[useNeighborhoodContent] Error fetching content:", error);
          throw error;
        }
        
        console.log("[useNeighborhoodContent] Fetched content:", data?.length || 0);
        return data as NeighborhoodContentItem[];
      } catch (err) {
        console.error("[useNeighborhoodContent] Error:", err);
        throw err;
      }
    },
    enabled: !!neighborhood?.id && !isLoadingNeighborhood,
  });
}

export default useNeighborhoodContent;
