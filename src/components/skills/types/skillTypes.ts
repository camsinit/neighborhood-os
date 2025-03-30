
// Types for skills system
export type SkillCategory = 'technology' | 'creative' | 'trade' | 'education' | 'wellness';

// Make sure this matches exactly what's in the database enum
export type SkillRequestType = 'offer' | 'need';

// Updated to match the database enum values
export type SkillStatus = 'pending' | 'pending_scheduling' | 'pending_provider_times' | 'pending_requester_confirmation' | 'scheduled' | 'confirmed' | 'completed' | 'expired' | 'in_progress';

// Define notification action types for skills
export type SkillNotificationActionType = 'confirm' | 'view' | 'schedule';

export interface Skill {
  id: string;
  title: string;
  description: string | null;
  request_type: SkillRequestType;
  skill_category: SkillCategory;
  user_id: string;
  created_at: string;
  valid_until: string;
  availability: string | null;
  time_preferences: string[] | null;
  status?: SkillStatus;
  // Adding these DB fields that were missing from our type
  neighborhood_id: string;
  is_archived?: boolean | null;
  is_read?: boolean | null;
}

// Create a type for the skill with profile information
export interface SkillWithProfile extends Skill {
  profiles: {
    avatar_url: string | null;
    display_name: string | null;
  };
}

// Helper type guard function to validate request types
export function isValidRequestType(value: string): value is SkillRequestType {
  return value === 'offer' || value === 'need';
}

// Interface for skill request notification data
export interface SkillRequestNotification {
  skillId: string;
  requesterId: string;
  providerId: string;
  skillTitle: string;
  requesterName: string | null;
  requesterAvatar: string | null;
  timePreferences?: string[] | null;
  availability?: string | null;
}
