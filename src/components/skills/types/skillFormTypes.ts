
export type SkillCategory = 'technology' | 'creative' | 'trade' | 'education' | 'wellness';

export type SkillAvailability = 'weekdays' | 'weekends' | 'both';
export type TimePreference = 'morning' | 'afternoon' | 'evening';

export interface SkillFormData {
  title: string;
  description: string;
  category: SkillCategory;
  availability?: SkillAvailability;
  timePreference?: TimePreference[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  expectedDuration?: string;
}

export interface SkillFormProps {
  onClose: () => void;
  mode: 'offer' | 'request';
}
