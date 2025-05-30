
/**
 * Notification Formatting Utilities
 * 
 * Helper functions for formatting notification data for display
 */
import { formatDistanceToNow } from 'date-fns';
import { Notification, EnhancedNotification } from '../types';
import { getNavigationForContentType, canNavigateToNotification } from './navigationMaps';

/**
 * Enhance a notification with display data
 */
export function enhanceNotification(notification: Notification, actorProfile?: any): EnhancedNotification {
  return {
    ...notification,
    actor_profile: actorProfile ? {
      id: actorProfile.id,
      display_name: actorProfile.display_name,
      avatar_url: actorProfile.avatar_url
    } : undefined,
    timeAgo: formatDistanceToNow(new Date(notification.created_at), { addSuffix: true }),
    canNavigate: canNavigateToNotification(notification.content_type, notification.content_id),
    highlightType: getNavigationForContentType(notification.content_type)?.highlightType
  };
}

/**
 * Get display name for notification actor
 */
export function getActorDisplayName(notification: EnhancedNotification): string {
  return notification.actor_profile?.display_name || 'A neighbor';
}

/**
 * Get notification priority level based on relevance score
 */
export function getNotificationPriority(relevanceScore?: number): 'low' | 'medium' | 'high' {
  if (!relevanceScore) return 'low';
  if (relevanceScore >= 3) return 'high';
  if (relevanceScore >= 2) return 'medium';
  return 'low';
}
