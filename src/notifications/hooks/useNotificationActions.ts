
/**
 * Notification Actions Hook
 * 
 * Handles all notification actions: mark as read, archive, navigation
 */
import { useState } from 'react';
import { toast } from 'sonner';
import { markAsRead, archiveNotification } from '@/hooks/notifications/notificationActions';
import { useNotificationNavigation } from './useNotificationNavigation';
import { EnhancedNotification, NotificationActionResult } from '../types';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useNotificationActions');

export function useNotificationActions() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const { navigateToNotification } = useNotificationNavigation();

  /**
   * Set loading state for a specific notification
   */
  const setLoading = (notificationId: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [notificationId]: loading
    }));
  };

  /**
   * Mark notification as read
   */
  const markNotificationAsRead = async (notification: EnhancedNotification): Promise<NotificationActionResult> => {
    if (notification.is_read) {
      return { success: true };
    }

    setLoading(notification.id, true);
    
    try {
      const success = await markAsRead(notification.content_type, notification.id);
      
      if (!success) {
        throw new Error('Failed to mark as read');
      }

      logger.debug('Marked notification as read:', notification.id);
      return { success: true };
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      return { 
        success: false, 
        error: 'Failed to mark as read' 
      };
    } finally {
      setLoading(notification.id, false);
    }
  };

  /**
   * Archive notification
   */
  const archiveNotificationAction = async (notification: EnhancedNotification): Promise<NotificationActionResult> => {
    setLoading(notification.id, true);
    
    try {
      const success = await archiveNotification(notification.id);
      
      if (!success) {
        throw new Error('Failed to archive');
      }

      toast.success('Notification archived');
      logger.debug('Archived notification:', notification.id);
      return { success: true };
    } catch (error) {
      logger.error('Error archiving notification:', error);
      toast.error('Failed to archive notification');
      return { 
        success: false, 
        error: 'Failed to archive' 
      };
    } finally {
      setLoading(notification.id, false);
    }
  };

  /**
   * Handle "View" action - mark as read and navigate with highlighting
   */
  const handleViewNotification = async (notification: EnhancedNotification): Promise<NotificationActionResult> => {
    setLoading(notification.id, true);

    try {
      // Mark as read first (don't wait for it)
      if (!notification.is_read) {
        markNotificationAsRead(notification);
      }

      // Navigate with highlighting
      const navigated = await navigateToNotification(notification);
      
      if (!navigated) {
        return { 
          success: false, 
          error: 'Unable to navigate to this content' 
        };
      }

      return { success: true };
    } catch (error) {
      logger.error('Error viewing notification:', error);
      return { 
        success: false, 
        error: 'Failed to view notification' 
      };
    } finally {
      setLoading(notification.id, false);
    }
  };

  /**
   * Check if notification is loading
   */
  const isLoading = (notificationId: string): boolean => {
    return Boolean(loadingStates[notificationId]);
  };

  return {
    markNotificationAsRead,
    archiveNotificationAction,
    handleViewNotification,
    isLoading
  };
}
