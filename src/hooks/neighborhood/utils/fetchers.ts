
/**
 * Utility functions for neighborhood data fetching
 * 
 * This file contains functions that interface with Supabase
 * to fetch neighborhood data safely
 */
import { supabase } from '@/integrations/supabase/client';
import { Neighborhood } from '@/contexts/neighborhood/types';
import { logError, logDebug } from './errorLogging';

/**
 * Check if a user is a core contributor with access to all neighborhoods
 * Uses a security definer function to avoid RLS recursion
 * 
 * @param userId - The ID of the user to check
 * @returns Promise resolving to true if user is a core contributor, false otherwise
 */
export const checkCoreContributorStatus = async (userId: string): Promise<boolean> => {
  try {
    // Call the security definer function we created
    const { data, error } = await supabase
      .rpc('user_is_core_contributor_with_access', {
        user_uuid: userId
      });
    
    if (error) {
      logError('checking core contributor status', error, { userId });
      return false;
    }
    
    logDebug(`Core contributor status: ${!!data}`);
    return !!data;
  } catch (err) {
    logError('checking core contributor status', err, { userId });
    return false;
  }
};

/**
 * Fetch neighborhoods created by a specific user
 * Using direct query to avoid RLS recursion
 * 
 * @param userId - The ID of the user
 * @returns Promise resolving to neighborhoods created by the user
 */
export const fetchCreatedNeighborhoods = async (userId: string) => {
  try {
    logDebug(`Checking if user created neighborhoods ${userId}`);
    
    // This query is safe with our updated RLS policies
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id, name, created_by')
      .eq('created_by', userId);
    
    if (error) {
      logError('checking created neighborhoods', error, { userId });
      throw error;
    }
    
    return { data, error: null };
  } catch (err) {
    logError('checking created neighborhoods', err, { userId });
    throw err;
  }
};

/**
 * Fetch neighborhoods the user is a member of
 * Using the security definer function to avoid recursion
 * 
 * @param userId - The ID of the user
 * @returns Promise resolving to neighborhoods the user is a member of
 */
export const fetchNeighborhoodMembership = async (userId: string): Promise<Neighborhood[]> => {
  try {
    // Use the get_user_neighborhoods function to avoid RLS recursion
    const { data, error } = await supabase
      .rpc('get_user_neighborhoods', {
        user_uuid: userId
      });
    
    if (error) {
      logError('fetching neighborhood membership', error, { userId });
      return [];
    }
    
    return data || [];
  } catch (err) {
    logError('fetching neighborhood membership', err, { userId });
    return [];
  }
};

/**
 * Fetch all neighborhoods for a core contributor
 * Using security definer function to avoid RLS recursion
 * 
 * @param userId - The ID of the core contributor
 * @returns Promise resolving to all neighborhoods
 */
export const fetchAllNeighborhoodsForContributor = async (userId: string): Promise<Neighborhood[]> => {
  try {
    // Use our security definer function to get all neighborhoods
    const { data, error } = await supabase
      .rpc('get_all_neighborhoods_for_core_contributor', {
        user_uuid: userId
      });
    
    if (error) {
      logError('fetching neighborhoods for contributor', error, { userId });
      return [];
    }
    
    return data || [];
  } catch (err) {
    logError('fetching neighborhoods for contributor', err, { userId });
    return [];
  }
};
