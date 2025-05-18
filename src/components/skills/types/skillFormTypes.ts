
// Type definitions for the skill form

import { SkillCategory } from "./skillTypes";

export type TimePreference = 'morning' | 'afternoon' | 'evening';

export interface SkillFormData {
  category: string | SkillCategory;
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
