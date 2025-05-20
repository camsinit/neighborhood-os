
// This file contains all types related to the skill form
import { SkillCategory } from "./skillTypes";

// Types for the form component props
export interface SkillFormProps {
  onClose: () => void;
  mode: 'offer' | 'request';
}

// Type for time preference options
export type TimePreference = 'morning' | 'afternoon' | 'evening';

// Main form data structure
export interface SkillFormData {
  title?: string;
  description?: string;
  category?: SkillCategory;
  availability?: 'weekdays' | 'weekends' | 'both';
  timePreference?: TimePreference[];
}
