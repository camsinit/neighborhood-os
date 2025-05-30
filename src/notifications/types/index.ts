
/**
 * Enhanced Notification Types
 * 
 * Streamlined types for the new notification system with smart navigation support
 */

// Base notification interface from database
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  actor_id?: string;
  content_type: string;
  content_id: string;
  notification_type: string;
  action_type: string;
  action_label: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  relevance_score?: number;
  metadata?: Record<string, any>;
}

// Enhanced notification with profile data
export interface EnhancedNotification extends Notification {
  actor_profile?: {
    id: string;
    display_name?: string;
    avatar_url?: string;
  };
  timeAgo: string; // Pre-formatted time string
  canNavigate: boolean; // Whether this notification supports smart navigation
  highlightType?: 'event' | 'safety' | 'skills' | 'goods' | 'neighbors'; // For highlighting system
}

// Notification filter options
export interface NotificationFilters {
  showArchived?: boolean;
  contentTypes?: string[];
  isRead?: boolean;
  limit?: number;
}

// Navigation mapping types
export interface NavigationMapping {
  route: string;
  highlightType: 'event' | 'safety' | 'skills' | 'goods' | 'neighbors';
}

// Action result types
export interface NotificationActionResult {
  success: boolean;
  error?: string;
}
