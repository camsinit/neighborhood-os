
/**
 * Notification action functions
 * 
 * This file contains functions for performing actions on notifications
 * such as marking as read or archiving them.
 */
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { HighlightableItemType } from "@/utils/highlight/types";

/**
 * Helper function to determine the table name for a notification type
 * This is needed because some notifications are stored in specific tables
 * while others use the generic notifications table
 * 
 * @param type The notification type
 * @returns The corresponding database table name
 */
export const getTableName = (type: string): string => {
  // Map notification types to their respective tables
  // If no mapping exists, default to the 'notifications' table
  switch (type.toLowerCase()) {
    case 'safety':
      return 'safety_updates';
    case 'event':
      return 'events';
    case 'skills':
      return 'skills_exchange';
    case 'goods':
      return 'goods_exchange';
    case 'support':
      return 'support_requests';
    case 'neighbors':
      return 'neighborhood_members';
    default:
      // For any other notification types, use the generic notifications table
      return 'notifications';
  }
};

/**
 * Mark a notification as read
 * 
 * @param type The notification type
 * @param id The notification ID
 * @returns Promise resolving to success or failure
 */
export const markAsRead = async (type: string, id: string): Promise<boolean> => {
  try {
    // Get the table name for this notification type
    const table = getTableName(type);
    
    // Update the notification as read
    const { error } = await supabase
      .from(table)
      .update({ is_read: true })
      .eq('id', id);
    
    if (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Unexpected error marking notification as read:", error);
    return false;
  }
};

/**
 * Archive a notification
 * 
 * @param id The notification ID
 * @returns Promise resolving to success or failure
 */
export const archiveNotification = async (id: string): Promise<boolean> => {
  try {
    // Update the notification as archived
    const { error } = await supabase
      .from('notifications')
      .update({ is_archived: true })
      .eq('id', id);
    
    if (error) {
      console.error("Error archiving notification:", error);
      toast.error("Failed to archive notification");
      return false;
    }
    
    toast.success("Notification archived");
    return true;
  } catch (error) {
    console.error("Unexpected error archiving notification:", error);
    toast.error("Failed to archive notification");
    return false;
  }
};
