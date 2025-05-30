
/**
 * Notification Types - Direct from Supabase Schema
 * 
 * These types match exactly what comes from the database
 * No transformations or enhancements - keep it simple
 */

import { Database } from '@/integrations/supabase/types';

// Direct database notification type
export type Notification = Database['public']['Tables']['notifications']['Row'];

// Insert type for creating notifications
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

// Update type for modifying notifications
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

// Profile type for actor information
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Enhanced notification with profile data (minimal transformation)
export interface NotificationWithProfile extends Notification {
  profiles?: Profile | null;
}
