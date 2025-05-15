
// Define the skill category type
export type SkillCategory = 'technology' | 'creative' | 'trade' | 'education' | 'wellness';

// Base skill interface
export interface Skill {
  id: string;
  title: string;
  description: string;
  category: SkillCategory;
  is_request: boolean;
  user_id: string;
  neighborhood_id: string;
  created_at: string;
  availability?: string[];
  time_preference?: string;
}

// Extended skill interface with profile info
export interface SkillWithProfile extends Skill {
  profiles: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}
