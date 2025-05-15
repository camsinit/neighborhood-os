/**
 * useActivitiesDirect.ts
 * 
 * Fetches activity data directly from the database using Supabase.
 * This hook simplifies data fetching and provides real-time updates.
 */
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Activity } from '@/components/activity/types';
import { createLogger } from '@/utils/logger';
import { refreshEvents, EventActionType } from '@/utils/refreshEvents';

// Initialize logger for this module
const logger = createLogger('useActivitiesDirect');

/**
 * Fetches activities directly from the database
 */
const fetchActivities = async (): Promise<Activity[]> => {
  try {
    // Log the start of the fetch operation
    logger.debug('Fetching activities from Supabase');
    
    // Perform the Supabase query
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Handle any errors
    if (error) {
      logger.error('Error fetching activities:', error.message, error.details);
      throw new Error(error.message);
    }
    
    // Log the successful data retrieval
    logger.debug(`Successfully fetched ${data.length} activities`);
    
    // Return the data
    return data || [];
  } catch (error: any) {
    // Log any exceptions
    logger.error('Exception during activity fetch:', error.message);
    throw error;
  }
};

/**
 * useActivitiesDirect hook
 * 
 * Fetches activity data and provides real-time updates using React Query.
 * 
 * @returns query - React Query's query result object
 */
export const useActivitiesDirect = () => {
  // Use React Query to manage data fetching
  const query = useQuery({
    queryKey: ['activities'],
    queryFn: fetchActivities,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 60000, // 60 seconds
    onError: (error: any) => {
      logger.error('React Query error fetching activities:', error.message);
    }
  });
  
  // State to track subscription status
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // Set up real-time subscription using useEffect
  useEffect(() => {
    // Prevent multiple subscriptions
    if (isSubscribed) return;
    
    // Log the setup of the subscription
    logger.debug('Setting up real-time activity subscription');
    
    // Handler for refresh events
    const handleRefreshEvent = () => {
      logger.debug('Activity refresh event detected, refetching data');
      query.refetch();
    };
    
    // Subscribe to the 'activities-updated' event using refreshEvents utility
    const unsubscribe = refreshEvents.on('activities-updated', handleRefreshEvent);
    
    // Mark as subscribed
    setIsSubscribed(true);
    
    // Clean up subscription on unmount
    return () => {
      logger.debug('Cleaning up real-time activity subscription');
      unsubscribe();
      setIsSubscribed(false);
    };
  }, [query, isSubscribed]);
  
  // Return the query result
  return query;
};
