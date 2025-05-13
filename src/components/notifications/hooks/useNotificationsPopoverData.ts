
/**
 * useNotificationsPopoverData.ts
 * 
 * Simplified hook to fetch notification data for the notifications popover
 * Uses React Query's built-in polling capabilities for automatic refreshes
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BaseNotification } from "@/hooks/notifications/types";
import { createLogger } from "@/utils/logger";
import { refreshEvents } from "@/utils/refreshEvents";
import { useEffect } from "react";

// Create a dedicated logger for this hook
const logger = createLogger('useNotificationsPopoverData');

/**
 * Simple function to fetch notifications directly from the database
 * Without any complex transformations or processing
 */
const fetchNotifications = async (showArchived: boolean): Promise<BaseNotification[]> => {
  logger.debug(`Fetching notifications, showArchived=${showArchived}`);
  
  // Get the current user ID
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    logger.warn('No authenticated user found, returning empty notifications array');
    return [];
  }
  
  // Direct query to the notifications table with proper join for actor info
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      profiles:actor_id (
        display_name,
        avatar_url
      )
    `)
    .eq('user_id', user.id)
    .eq('is_archived', showArchived)
    .order('created_at', { ascending: false });
    
  if (error) {
    logger.error('Error fetching notifications:', error);
    throw error;
  }
  
  logger.debug(`Retrieved ${data?.length || 0} notifications`);
  
  // Transform the data to ensure it matches the BaseNotification type
  // Specifically, ensure every item has an updated_at property
  return (data || []).map(notification => {
    return {
      ...notification,
      // Ensure updated_at is present - use created_at as fallback if needed
      updated_at: notification.updated_at || notification.created_at
    } as BaseNotification;
  });
};

/**
 * Custom hook that provides notification data for the popover
 * Simplified to rely on React Query's built-in polling
 * 
 * @param showArchived - Whether to show archived notifications
 * @returns Query result with notification data
 */
export const useNotificationsPopoverData = (showArchived: boolean) => {
  // Use React Query with polling enabled
  const query = useQuery({
    queryKey: ["notifications", showArchived],
    queryFn: () => fetchNotifications(showArchived),
    // Set up automatic polling
    refetchInterval: 30000, // 30 seconds
    refetchIntervalInBackground: false,
    // Enable automatic refetching when window regains focus
    refetchOnWindowFocus: true,
    // Add some retry logic
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Set up listeners for specific events that should trigger a notification refresh
  useEffect(() => {
    // Create a handler for events that should trigger a refresh
    const handleRefreshEvent = () => {
      logger.debug("Refresh event detected, updating notifications");
      query.refetch();
    };
    
    // Listen for specific events that should trigger a refresh
    window.addEventListener('event-rsvp-updated', handleRefreshEvent);
    window.addEventListener('skills-updated', handleRefreshEvent);
    window.addEventListener('notification-created', handleRefreshEvent);
    
    // Set up subscription with refreshEvents utility
    const unsubscribe = refreshEvents.on('notification-created', handleRefreshEvent);
    
    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('event-rsvp-updated', handleRefreshEvent);
      window.removeEventListener('skills-updated', handleRefreshEvent);
      window.removeEventListener('notification-created', handleRefreshEvent);
      
      // Unsubscribe from the refreshEvents utility
      if (unsubscribe) unsubscribe();
    };
  }, [query]);
  
  // Return the simplified query result
  return query;
};
