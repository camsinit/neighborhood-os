
/**
 * Data fetching utilities for neighborhood hooks
 * 
 * This module contains the functions that interact with the Supabase database
 * to fetch neighborhood-related data
 */
import { supabase } from '@/integrations/supabase/client';
import { Neighborhood } from '@/contexts/neighborhood/types';
import { logError, logDebug } from './errorLogging';

/**
 * Check if a user is a core contributor with access to all neighborhoods
 * 
 * @param userId - The user's ID
 * @returns Boolean indicating if the user is a core contributor
 */
export const checkCoreContributorStatus = async (userId: string): Promise<boolean> => {
  try {
    logDebug('Checking core contributor access for user:', userId);
    const { data: hasAccess, error: coreError } = await supabase
      .rpc('user_is_core_contributor_with_access', {
        user_uuid: userId
      });
      
    if (coreError) {
      logError("checking core contributor access", coreError, { userId });
      throw coreError;
    }
    
    logDebug('Core contributor status:', !!hasAccess);
    return !!hasAccess;
  } catch (err) {
    logError("checking core contributor status", err, { userId });
    return false;
  }
};

/**
 * Fetch neighborhoods created by a user
 * 
 * @param userId - The user's ID
 * @returns Object containing neighborhoods data and any error
 */
export const fetchCreatedNeighborhoods = async (userId: string) => {
  try {
    logDebug('Checking if user created neighborhoods', userId);
    const response = await supabase
      .from('neighborhoods')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(1);
      
    return { data: response.data as Neighborhood[], error: response.error };
  } catch (err) {
    logError("fetching created neighborhoods", err, { userId });
    return { data: null, error: err };
  }
};

/**
 * Fetch neighborhood membership for a user
 * 
 * @param userId - The user's ID
 * @returns Array of neighborhoods the user is a member of
 */
export const fetchNeighborhoodMembership = async (userId: string) => {
  try {
    logDebug('Checking neighborhood membership for user:', userId);
    const { data, error } = await supabase
      .rpc('get_user_neighborhoods', {
        user_uuid: userId
      });
      
    if (error) {
      logError("checking neighborhood membership", error, { userId });
      throw error;
    }
    
    logDebug('Found neighborhood memberships:', data?.length || 0);
    return data as Neighborhood[];
  } catch (err) {
    logError("fetching neighborhood membership", err, { userId });
    throw err;
  }
};

/**
 * Fetch all available neighborhoods for a core contributor
 * 
 * @param userId - The user's ID
 * @returns Array of all neighborhoods accessible to the core contributor
 */
export const fetchAllNeighborhoodsForContributor = async (userId: string) => {
  try {
    logDebug('Fetching all neighborhoods for core contributor:', userId);
    const { data, error } = await supabase
      .rpc('get_all_neighborhoods_for_core_contributor', {
        user_uuid: userId
      });
      
    if (error) {
      logError("fetching all neighborhoods", error, { userId });
      throw error;
    }
    
    logDebug('Fetched neighborhoods count:', data?.length || 0);
    return data as Neighborhood[];
  } catch (err) {
    logError("fetching available neighborhoods", err, { userId });
    return [];
  }
};
