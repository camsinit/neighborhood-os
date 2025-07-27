/**
 * Simplified Unified Neighborhood Data Hook
 * 
 * This single hook handles all neighborhood data fetching for both regular users
 * and super admins, eliminating complex orchestration between multiple hooks.
 */
import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Neighborhood } from './types';
import { createLogger } from '@/utils/logger';

const logger = createLogger('NeighborhoodData');

/**
 * Unified hook that handles all neighborhood data fetching
 * 
 * @param user - The current authenticated user
 * @param neighborhoodIdFromUrl - Neighborhood ID from URL params (for super admin)
 * @param isSuperAdmin - Whether the user has super admin privileges
 * @returns Object containing neighborhood data and loading state
 */
export function useNeighborhoodData(
  user: User | null, 
  neighborhoodIdFromUrl?: string | null, 
  isSuperAdmin?: boolean
) {
  // Core state management
  const [currentNeighborhood, setCurrentNeighborhood] = useState<Neighborhood | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAuthStable, setIsAuthStable] = useState(false);

  // Stabilize auth state - wait for user to be defined or null
  useEffect(() => {
    if (user !== undefined) {
      const timer = setTimeout(() => {
        setIsAuthStable(true);
        logger.debug("Auth state stabilized:", { 
          isLoggedIn: !!user, 
          userId: user?.id
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Unified fetch function that handles both regular and super admin cases
  const fetchNeighborhoodData = useCallback(async (forceRefresh = false) => {
    if (!isAuthStable || !user) {
      logger.debug("Skipping fetch - auth not stable or no user");
      setIsLoading(false);
      return;
    }

    // Use a ref to check current neighborhood without including it in dependencies
    const currentId = currentNeighborhood?.id;
    const targetId = isSuperAdmin && neighborhoodIdFromUrl ? neighborhoodIdFromUrl : null;
    
    // Skip fetch if we already have the target neighborhood (unless forced)
    if (!forceRefresh && currentId && targetId && currentId === targetId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      logger.debug("Fetching neighborhood data:", {
        userId: user.id,
        isSuperAdmin,
        neighborhoodIdFromUrl,
        targetId,
        currentId
      });

      let neighborhood: Neighborhood | null = null;

      if (isSuperAdmin && neighborhoodIdFromUrl) {
        // Super admin mode: fetch specific neighborhood by ID
        const { data, error: fetchError } = await supabase
          .from('neighborhoods')
          .select('*')
          .eq('id', neighborhoodIdFromUrl)
          .single();

        if (fetchError) {
          throw new Error(`Failed to fetch neighborhood: ${fetchError.message}`);
        }

        neighborhood = data;
        logger.debug("Super admin neighborhood fetched:", { neighborhoodId: data?.id, name: data?.name });
      } else {
        // Regular mode: fetch user's neighborhood
        // First try neighborhoods they created
        const { data: createdNeighborhoods, error: createdError } = await supabase
          .from('neighborhoods')
          .select('*')
          .eq('created_by', user.id)
          .limit(1);

        if (createdError) {
          throw new Error(`Failed to fetch created neighborhoods: ${createdError.message}`);
        }

        if (createdNeighborhoods && createdNeighborhoods.length > 0) {
          neighborhood = createdNeighborhoods[0];
          logger.debug("Found created neighborhood:", { neighborhoodId: neighborhood.id, name: neighborhood.name });
        } else {
          // Then try neighborhoods they're a member of
          const { data: memberData, error: memberError } = await supabase
            .from('neighborhood_members')
            .select(`
              neighborhoods:neighborhood_id (*)
            `)
            .eq('user_id', user.id)
            .eq('status', 'active')
            .limit(1);

          if (memberError) {
            throw new Error(`Failed to fetch member neighborhoods: ${memberError.message}`);
          }

          if (memberData && memberData.length > 0 && memberData[0].neighborhoods) {
            neighborhood = memberData[0].neighborhoods as Neighborhood;
            logger.debug("Found member neighborhood:", { neighborhoodId: neighborhood.id, name: neighborhood.name });
          } else {
            logger.debug("No neighborhoods found for user");
          }
        }
      }

      // Only update state if the neighborhood actually changed
      setCurrentNeighborhood(prev => {
        if (prev?.id !== neighborhood?.id) {
          logger.debug("Neighborhood changed:", { 
            from: prev?.id, 
            to: neighborhood?.id 
          });
          return neighborhood;
        }
        return prev;
      });
      
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logger.error("Error fetching neighborhood data:", errorMessage);
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthStable, user, isSuperAdmin, neighborhoodIdFromUrl]); // REMOVED currentNeighborhood from dependencies

  // Manual refresh function
  const refreshNeighborhoodData = useCallback(() => {
    logger.debug("Manual refresh triggered");
    fetchNeighborhoodData(true);
  }, [fetchNeighborhoodData]);

  // Main effect to trigger data fetching
  useEffect(() => {
    fetchNeighborhoodData();
  }, [fetchNeighborhoodData]);

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    if (!isLoading) return;

    const safetyTimer = setTimeout(() => {
      if (isLoading) {
        logger.warn("Safety timeout triggered - clearing loading state");
        setIsLoading(false);
        setError(new Error("Request timed out"));
      }
    }, 10000);

    return () => clearTimeout(safetyTimer);
  }, [isLoading]);

  // Debug logging for the test user
  useEffect(() => {
    if (user?.id === '74bf3085-8275-4eb2-a721-8c8e91b3d3d8') {
      console.log('[DEBUG - User 74bf...] Unified neighborhood data:', {
        currentNeighborhood: currentNeighborhood?.name,
        currentNeighborhoodId: currentNeighborhood?.id,
        isLoading,
        error: error?.message,
        isSuperAdmin,
        neighborhoodIdFromUrl,
        timestamp: new Date().toISOString()
      });
    }
  }, [currentNeighborhood, isLoading, error, user?.id, isSuperAdmin, neighborhoodIdFromUrl]);

  return {
    currentNeighborhood,
    isLoading,
    error,
    setCurrentNeighborhood,
    refreshNeighborhoodData
  };
}