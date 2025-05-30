
/**
 * Smart Navigation Hook for Notifications
 * 
 * Handles navigation to notification content with automatic highlighting
 */
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { navigateAndHighlight } from '@/utils/highlight';
import { getNavigationForContentType } from '../utils/navigationMaps';
import { EnhancedNotification } from '../types';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useNotificationNavigation');

export function useNotificationNavigation() {
  const navigate = useNavigate();

  /**
   * Navigate to notification content and highlight it
   */
  const navigateToNotification = async (notification: EnhancedNotification): Promise<boolean> => {
    try {
      logger.debug('Navigating to notification:', {
        id: notification.id,
        contentType: notification.content_type,
        contentId: notification.content_id
      });

      // Get navigation mapping for this content type
      const navigationInfo = getNavigationForContentType(notification.content_type);
      
      if (!navigationInfo) {
        logger.warn('No navigation mapping found for content type:', notification.content_type);
        toast.error('Unable to navigate to this notification');
        return false;
      }

      // Show loading toast
      toast.loading('Navigating...', { id: `nav-${notification.id}` });

      // Use the existing smart navigation system
      navigateAndHighlight(
        navigationInfo.highlightType,
        notification.content_id,
        navigate
      );

      // Success toast after a short delay
      setTimeout(() => {
        toast.success('Found and highlighted!', { id: `nav-${notification.id}` });
      }, 100);

      return true;
    } catch (error) {
      logger.error('Error navigating to notification:', error);
      toast.error('Failed to navigate', { id: `nav-${notification.id}` });
      return false;
    }
  };

  return {
    navigateToNotification
  };
}
