/**
 * Main function to fetch all notifications from various sources
 */
import { BaseNotification } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { fetchDirectNotifications } from "./fetchDirectNotifications";
import { createLogger } from "@/utils/logger";

const logger = createLogger('fetchNotifications');

/**
 * Main function to fetch all notifications from various sources
 * Now enhanced to include direct notifications from the notifications table
 */
export const fetchAllNotifications = async (showArchived: boolean): Promise<BaseNotification[]> => {
  logger.debug('Fetching all notifications, showArchived:', showArchived);
  
  // IMPORTANT: First, fetch direct notifications as the primary source of truth
  const directNotifications = await fetchDirectNotifications(showArchived);
  
  // Log the count of direct notifications
  logger.debug(`Found ${directNotifications.length} direct notifications`);
  
  // Now that we've migrated completely to database-generated notifications,
  // we're only using notifications from the notifications table
  return directNotifications;
};

// This function maintains the original export signature but only uses the direct notifications
// Other notification fetching functions are preserved but no longer used

// Keep existing functions for backward compatibility
export const fetchSafetyNotifications = async () => ({ data: [], error: null });
export const fetchEventNotifications = async () => ({ data: [], error: null });
export const fetchSupportNotifications = async () => ({ data: [], error: null });
export const fetchGoodsNotifications = async () => ({ data: [], error: null });
export const fetchSkillNotifications = async () => ({ data: [], error: null });
export const isSkillSession = () => false;
export const isNotification = () => true;
export const processSafetyNotifications = () => [];
export const processEventNotifications = () => [];
export const processSupportNotifications = () => [];
export const processSkillNotifications = () => [];
export const processGoodsNotifications = () => [];
export const fetchUserProfiles = async () => ({ data: [], error: null });
export const createProfilesMap = () => new Map();
