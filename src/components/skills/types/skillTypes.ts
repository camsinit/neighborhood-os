
// Types for skills system
export type SkillCategory = 'technology' | 'creative' | 'trade' | 'education' | 'wellness';

// Make sure this matches exactly what's in the database enum
export type SkillRequestType = 'offer' | 'need';

export type SkillStatus = 'pending' | 'pending_scheduling' | 'scheduled' | 'completed';

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
