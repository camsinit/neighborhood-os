// Define the skill category type - now matching onboarding categories exactly
export type SkillCategory = 'technology' | 'emergency' | 'professional' | 'maintenance' | 'care' | 'education';

/**
 * Legacy category mapping for backwards compatibility
 * Maps old database categories to new standardized categories
 */
export const LEGACY_CATEGORY_MAPPING: Record<string, SkillCategory> = {
  'wellness': 'care',
  'creative': 'education', 
  'trade': 'maintenance',
  // Include current categories for passthrough
  'technology': 'technology',
  'emergency': 'emergency',
  'professional': 'professional',
  'maintenance': 'maintenance',
  'care': 'care',
  'education': 'education'
};

/**
 * Utility function to map any category (including legacy) to current categories
 */
export function mapToCurrentCategory(category: string): SkillCategory {
  return LEGACY_CATEGORY_MAPPING[category] || 'professional';
}

// Define valid request types - matching the database values exactly
export type SkillRequestType = 'offer' | 'need';

/**
 * Utility function to check if a value is a valid request type
 * This helps with type safety when working with data from the database
 */
export function isValidRequestType(value: any): value is SkillRequestType {
  return value === 'offer' || value === 'need';
}

// Base skill interface that matches the database schema
export interface Skill {
  id: string;
  title: string;
  description: string;
  skill_category: SkillCategory; // Changed from 'category' to match DB
  request_type: SkillRequestType; // Changed from 'is_request' to match DB
  user_id: string;
  neighborhood_id: string;
  created_at: string;
  availability?: string | null;
  time_preferences?: string[] | null; // Changed from 'time_preference' (singular) to match DB
  is_archived?: boolean;
  is_read?: boolean;
  valid_until?: string;
  status?: string;
}

// Extended skill interface with profile info
export interface SkillWithProfile extends Skill {
  profiles: {
    id?: string;
    display_name: string | null;
    avatar_url?: string | null;
  };
}

/**
 * Type for skill request notifications
 * Used for rendering skill request popover/drawer
 */
export interface SkillRequestNotification {
  skillId: string;
  skillTitle: string;
  requesterId: string;
  requesterName?: string;
  requesterAvatar?: string;
  timePreferences?: string[];
  availability?: string;
}
