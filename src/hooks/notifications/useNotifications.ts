
/**
 * Custom hook for fetching notifications
 */
import { useQuery } from "@tanstack/react-query";
import { BaseNotification } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger
const logger = createLogger('useNotifications');

/**
 * Fetch notifications directly from the database
 * 
 * @param showArchived - Whether to include archived notifications
 * @returns Array of notifications
 */
const fetchNotifications = async (showArchived: boolean): Promise<BaseNotification[]> => {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    logger.warn('No authenticated user found, returning empty notifications array');
    return [];
  }
  
  // Query notifications joined with profiles
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
  
  return data || [];
};

/**
 * Custom hook to fetch and manage notifications
 * 
 * @param showArchived - Whether to show archived notifications
 * @returns Query object with notifications data
 */
export const useNotifications = (showArchived: boolean) => {
  return useQuery({
    queryKey: ["notifications", showArchived],
    queryFn: () => fetchNotifications(showArchived),
    refetchInterval: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};

export type { BaseNotification };
