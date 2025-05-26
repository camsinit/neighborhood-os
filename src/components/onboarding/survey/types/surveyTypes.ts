
/**
 * Type definitions for the onboarding survey
 */

/**
 * Main survey form data structure
 * Now includes profile image, bio, contact visibility preferences, and skill availability
 */
export interface SurveyFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  skills: string[];
  // New fields for enhanced onboarding
  profileImage?: File;
  bio?: string;
  emailVisible: boolean;
  phoneVisible: boolean;
  addressVisible: boolean;
  skillAvailability?: string;
  skillTimePreferences?: string[];
}

/**
 * Skill availability and time preferences data
 */
export interface SkillAvailabilityData {
  availability: string;
  timePreferences: string[];
  dayPreferences: string[];
}

/**
 * Form submission state
 */
export interface FormSubmissionState {
  isSubmitting: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}
