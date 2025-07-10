
/**
 * Survey form data structure for onboarding
 * 
 * Contains all the data collected during the onboarding survey process.
 * This data is used to create user accounts, profiles, and initial skills.
 * 
 * UPDATED: Removed availability fields - no longer collected during onboarding
 */
export interface SurveyFormData {
  // Basic information
  firstName: string;
  lastName: string;
  
  // Contact information  
  email: string;
  phone: string;
  password: string;
  
  // Privacy settings
  emailVisible: boolean;
  phoneVisible: boolean;
  
  // Address information
  address: string;
  
  // Profile image
  profileImage: File | null;
  
  // Skills removed - skills onboarding moved to Skills page
}

/**
 * Form validation state tracking
 */
export interface ValidationState {
  [key: string]: boolean;
}

/**
 * Skills survey state for tracking completion
 */
export interface SkillsSurveyState {
  hasCompletedSurvey: boolean;
  hasSelectedSkills: boolean;
}

/**
 * Form submission state for UI feedback
 */
export interface FormSubmissionState {
  isSubmitting: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}
