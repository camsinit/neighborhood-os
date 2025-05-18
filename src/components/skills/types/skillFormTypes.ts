
// If this file exists, we'll update it; if not, we'll create it

export type TimePreference = 'morning' | 'afternoon' | 'evening';

export interface SkillFormData {
  category: string;
  title?: string;
  description?: string;
  availability?: 'weekdays' | 'weekends' | 'both';
  timePreference: TimePreference[];
}

export interface SkillFormProps {
  mode: 'offer' | 'request';
  onSuccess: () => void;
  onCancel: () => void;
}
