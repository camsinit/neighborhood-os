
// This file defines types used throughout the application

/**
 * User profile information
 */
export interface Profile {
  id?: string;  // Make id optional to match what comes from the database
  display_name: string;
  avatar_url: string;
  created_at?: string;
  email?: string;  // Add email field to the Profile interface
}


/**
 * Community event - used exclusively on the Calendar page
 */
export interface Event {
  id: string;
  event_id: string; // Existing redundant ID field
  title: string;
  description: string;
  time: string;
  location: string;
  host_id: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  recurrence_end_date?: string;
  created_at: string;
  neighborhood_id: string; // Add neighborhood_id field which is required for activities
  group_id?: string; // Optional group ID for group events
  profiles?: Profile; // Profile of the host
  group?: {
    id: string;
    name: string;
    group_type: string;
  }; // Optional group information for group events
  metadata?: {
    isRecurringInstance?: boolean;
    originalEventId?: string;
    originalDate?: string;
    [key: string]: any;
  }; // Optional metadata for recurring instances and other purposes
}

/**
 * Legacy support request - maintained for backward compatibility
 * New features should use their own dedicated interfaces and tables
 * 
 * @deprecated Use feature-specific interfaces instead: GoodsExchangeItem, SkillExchangeItem, etc.
 */
export interface SupportRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  request_type: string;
  support_type: string;
  user_id: string;
  valid_until: string;
  image_url: string | null;
  created_at: string;
  is_archived: boolean | null;
  is_read: boolean | null;
  // Changed from specific union type to string to fix type issues
  skill_category?: string;
  // Change this to match the structure coming from the database
  profiles: Profile;
}


/**
 * Skills exchange item - used exclusively on the Skills page
 * This interface represents items in the skills_exchange table
 */
export interface SkillExchangeItem {
  id: string;
  skill_id: string; // Added redundant ID field
  title: string;
  description: string;
  request_type: 'need' | 'offer';
  user_id: string;
  valid_until: string;
  created_at: string;
  is_archived: boolean | null;
  is_read: boolean | null;
  skill_category: string;
  availability?: string;
  time_preferences?: string[];
  profiles?: Profile; // Profile of the provider/requester
}

