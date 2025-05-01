
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
 * Safety update - used exclusively on the Safety page
 */
export interface SafetyUpdate {
  id: string;
  title: string;
  description: string;
  type: string;
  author_id: string;
  created_at: string;
  profiles?: Profile; // Profile of the author
}

/**
 * Community event - used exclusively on the Calendar page
 */
export interface Event {
  id: string;
  title: string;
  description: string;
  time: string;
  location: string;
  host_id: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  recurrence_end_date?: string;
  created_at: string;
  profiles?: Profile; // Profile of the host
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
 * Goods exchange item - used exclusively on the Goods page
 * This interface represents items in the goods_exchange table
 */
export interface GoodsExchangeItem {
  id: string;
  title: string;
  description: string;
  category: string; // Always 'goods'
  request_type: 'need' | 'offer';
  user_id: string;
  valid_until: string;
  created_at: string;
  is_archived: boolean | null;
  is_read: boolean | null;
  goods_category?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  images?: string[]; // Support for multiple images
  image_url?: string | null; // Single image URL (legacy support)
  profiles?: Profile; // Profile of the provider/requester
  neighborhood_id: string; // Add neighborhood_id field which is required by the database
}

/**
 * Skills exchange item - used exclusively on the Skills page
 * This interface represents items in the skills_exchange table
 */
export interface SkillExchangeItem {
  id: string;
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
