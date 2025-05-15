
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { dispatchRefreshEvent } from "@/utils/refreshEvents";

/**
 * Mark a notification as read
 * 
 * @param id The notification ID to mark as read
 * @param showToast Whether to show a confirmation toast
 * @returns Success status
 */
export const markNotificationAsRead = async (
  id: string,
  showToast: boolean = false
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
      
    if (error) {
      console.error('Error marking notification as read:', error);
      
      if (showToast) {
        toast.error('Failed to mark notification as read');
      }
      
      return false;
    }
    
    // Dispatch a refresh event for notifications
    dispatchRefreshEvent('notifications-read');
    
    if (showToast) {
      toast.success('Notification marked as read');
    }
    
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    
    if (showToast) {
      toast.error('Failed to mark notification as read');
    }
    
    return false;
  }
};

/**
 * Mark all notifications as read
 * 
 * @param showArchived Whether to include archived notifications
 * @returns Success status
 */
export const markAllNotificationsAsRead = async (
  showArchived: boolean = false
): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user?.id) {
      return false;
    }
    
    // Update notifications for current user
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userData.user.id)
      .eq('is_archived', showArchived);
      
    if (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
      return false;
    }
    
    // Dispatch a refresh event for notifications
    dispatchRefreshEvent('notifications-read');
    
    toast.success('All notifications marked as read');
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    toast.error('Failed to mark all notifications as read');
    return false;
  }
};

/**
 * Archive a notification
 * 
 * @param id The notification ID to archive
 * @param showToast Whether to show a confirmation toast
 * @returns Success status
 */
export const archiveNotification = async (
  id: string, 
  showToast: boolean = false
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_archived: true })
      .eq('id', id);
      
    if (error) {
      console.error('Error archiving notification:', error);
      
      if (showToast) {
        toast.error('Failed to archive notification');
      }
      
      return false;
    }
    
    // Dispatch a refresh event for notifications
    dispatchRefreshEvent('notifications-read');
    
    if (showToast) {
      toast.success('Notification archived');
    }
    
    return true;
  } catch (error) {
    console.error('Error archiving notification:', error);
    
    if (showToast) {
      toast.error('Failed to archive notification');
    }
    
    return false;
  }
};
