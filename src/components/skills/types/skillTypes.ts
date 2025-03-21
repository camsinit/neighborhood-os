
// Types for skills system
export type SkillCategory = 'technology' | 'creative' | 'trade' | 'education' | 'wellness';

export type SkillStatus = 'pending' | 'pending_scheduling' | 'scheduled' | 'completed';

export interface Skill {
  id: string;
  title: string;
  description: string | null;
  request_type: 'offer' | 'need';
  skill_category: SkillCategory;
  user_id: string;
  created_at: string;
  valid_until: string;
  availability: string | null;
  time_preferences: string[] | null;
  status?: SkillStatus; // Add status property as optional
}
