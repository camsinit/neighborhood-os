
/**
 * Simplified Notification Types
 * 
 * Centralized type definitions for the notification system
 */

import { Database } from '@/integrations/supabase/types';

// Core database types
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

// Notification types supported by the system
export type NotificationType = 'event' | 'safety' | 'care' | 'goods' | 'skills' | 'neighbor_welcome';

// Action types for notifications
export type NotificationActionType = 'view' | 'respond' | 'schedule' | 'help' | 'learn' | 'rsvp' | 'comment' | 'share';

// Enhanced notification with profile data
export interface NotificationWithProfile extends Notification {
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  } | null;
}
