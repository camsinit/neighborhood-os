import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Interface for neighborhood preview data
 */
interface NeighborhoodPreviewData {
  id: string;
  name: string;
  city?: string;
  state?: string;
  created_at: string;
  memberCount: number;
}

/**
 * Hook to fetch neighborhood data for preview purposes
 * 
 * This hook fetches the current user's neighborhood information
 * so it can be displayed in the invite preview mode.
 */
export const useNeighborhoodPreview = () => {
  const [neighborhood, setNeighborhood] = useState<NeighborhoodPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch neighborhood data for the given neighborhood ID
   */
  const fetchNeighborhoodPreview = async (neighborhoodId: string) => {
    if (!neighborhoodId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch basic neighborhood information
      const { data: neighborhoodData, error: neighborhoodError } = await supabase
        .from('neighborhoods')
        .select('id, name, city, state, created_at')
        .eq('id', neighborhoodId)
        .single();

      if (neighborhoodError) {
        throw neighborhoodError;
      }

      // Fetch member count
      const { count: memberCount, error: countError } = await supabase
        .from('neighborhood_members')
        .select('*', { count: 'exact', head: true })
        .eq('neighborhood_id', neighborhoodId)
        .eq('status', 'active');

      if (countError) {
        console.warn('Failed to fetch member count:', countError);
      }

      // Set the neighborhood preview data
      const previewData: NeighborhoodPreviewData = {
        id: neighborhoodData.id,
        name: neighborhoodData.name,
        city: neighborhoodData.city,
        state: neighborhoodData.state,
        created_at: neighborhoodData.created_at,
        memberCount: memberCount || 0
      };

      setNeighborhood(previewData);
    } catch (err: any) {
      console.error('Error fetching neighborhood preview:', err);
      setError(err.message || 'Failed to fetch neighborhood information');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    neighborhood,
    isLoading,
    error,
    fetchNeighborhoodPreview
  };
};