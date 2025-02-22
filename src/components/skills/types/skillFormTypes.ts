
import { SkillCategory } from "./skillTypes";

export interface SkillFormProps {
  onClose: () => void;
  mode: 'offer' | 'request';
}

export type TimePreference = 'morning' | 'afternoon' | 'evening';

export interface SkillFormData {
  title?: string;
  description?: string;
  category?: SkillCategory;
  availability?: 'weekdays' | 'weekends' | 'both';
  timePreference?: TimePreference[];
}
