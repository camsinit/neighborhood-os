/**
 * Hook for fetching specific neighborhood by ID (for super admin)
 * 
 * This hook allows super admins to fetch any neighborhood by ID,
 * bypassing the normal user-neighborhood relationship restrictions.
 */
import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('FetchNeighborhoodById');

/**
 * Custom hook that fetches a specific neighborhood by ID
 * 
 * @param user - The current authenticated user
 * @param neighborhoodId - The ID of the neighborhood to fetch
 * @param isSuperAdmin - Whether the user has super admin privileges
 * @param statusFunctions - Functions to update loading/error status
 * @returns Object containing neighborhood data
 */
export function useFetchNeighborhoodById(
  user: User | null,
  neighborhoodId: string | null,
  isSuperAdmin: boolean,
  { 
    startFetch, 
    completeFetch, 
    handleFetchError,
    setIsLoading
  }: {
    startFetch: () => number;
    completeFetch: (startTime: number) => void;
    handleFetchError: (err: any, startTime?: number) => void;
    setIsLoading: (isLoading: boolean) => void;
  }
) {
  const [currentNeighborhood, setCurrentNeighborhood] = useState<Neighborhood | null>(null);

  // The main fetch function that retrieves neighborhood data by ID
  const fetchNeighborhoodById = useCallback(async (forceRefresh = false) => {
    // Add debug logging for the problematic user
    if (user?.id === '74bf3085-8275-4eb2-a721-8c8e91b3d3d8') {
      logger.debug("[DEBUG - User 74bf...] fetchNeighborhoodById called:", {
        neighborhoodId,
        currentNeighborhoodId: currentNeighborhood?.id,
        forceRefresh,
        isSuperAdmin,
        timestamp: new Date().toISOString()
      });
    }

    // Skip if no user, no neighborhood ID, or not super admin
    if (!user || !neighborhoodId || !isSuperAdmin) {
      if (user?.id === '74bf3085-8275-4eb2-a721-8c8e91b3d3d8') {
        logger.debug("[DEBUG - User 74bf...] Skipping fetch:", { user: !!user, neighborhoodId, isSuperAdmin });
      }
      setIsLoading(false);
      return;
    }

    // Always fetch if the neighborhood ID is different, or if forcing refresh
    // Remove the early return that was preventing switching between neighborhoods
    if (currentNeighborhood?.id === neighborhoodId && !forceRefresh) {
      if (user?.id === '74bf3085-8275-4eb2-a721-8c8e91b3d3d8') {
        logger.debug("[DEBUG - User 74bf...] Already have this neighborhood, skipping");
      }
      setIsLoading(false);
      return;
    }

    // Start timing and tracking the fetch operation
    const startTime = startFetch();
    
    try {
      logger.debug("Fetching neighborhood by ID:", neighborhoodId);

      // Fetch the specific neighborhood by ID
      const { data: neighborhood, error } = await supabase
        .from('neighborhoods')
        .select('id, name, created_by, city, state, timezone, invite_header_image_url, zip, address, geo_boundary, created_at')
        .eq('id', neighborhoodId)
        .single();

      if (error) {
        logger.warn("Error getting neighborhood by ID:", error);
        handleFetchError(error, startTime);
        return;
      }

      if (neighborhood) {
        logger.debug("Found neighborhood:", neighborhood.name);
        if (user?.id === '74bf3085-8275-4eb2-a721-8c8e91b3d3d8') {
          logger.debug("[DEBUG - User 74bf...] Setting new neighborhood:", {
            from: currentNeighborhood?.name,
            to: neighborhood.name,
            id: neighborhood.id
          });
        }
        setCurrentNeighborhood(neighborhood as Neighborhood);
        completeFetch(startTime);
        return;
      }
      
      logger.debug("Neighborhood not found:", neighborhoodId);
      setCurrentNeighborhood(null);
      completeFetch(startTime);
      
    } catch (err) {
      // Handle unexpected errors
      handleFetchError(err, startTime);
      setCurrentNeighborhood(null);
    }
  }, [
    user, 
    neighborhoodId,
    isSuperAdmin,
    // Remove currentNeighborhood from dependencies to avoid stale closures
    // that prevent switching between neighborhoods
    startFetch,
    completeFetch,
    handleFetchError,
    setIsLoading
  ]);

  return {
    currentNeighborhood,
    setCurrentNeighborhood,
    fetchNeighborhoodById
  };
}