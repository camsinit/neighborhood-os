
/**
 * Survey form data structure for onboarding
 * 
 * Contains all the data collected during the onboarding survey process.
 * This data is used to create user accounts, profiles, and initial skills.
 * 
 * UPDATED: OAuth-aware structure with conditional fields based on auth method
 */
export interface SurveyFormData {
  // Auth method tracking
  authMethod: 'oauth' | 'manual';
  isDataPrePopulated: boolean;
  
  // Basic information (may be pre-populated from OAuth)
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string; // From OAuth provider
  
  // User-provided information
  yearMovedIn: number | null;
  phone: string;
  address: string;
  
  // Auth-specific fields
  password?: string; // Only for manual signup
  profileImage?: File | null; // Only if uploading new image
  
  // Privacy settings
  emailVisible: boolean;
  phoneVisible: boolean;
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
