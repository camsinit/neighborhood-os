export interface FormSubmissionState {
  isSubmitting: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

/**
 * Survey form data interface
 * Contains all the data collected during the onboarding survey.
 * 
 * UPDATED: Now includes password field for guest onboarding
 */
export interface SurveyFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string; // New field for guest onboarding
  address: string;
  bio?: string;
  profileImage?: File | null;
  skills: string[];
  skillAvailability?: string;
  skillTimePreferences?: string[];
  emailVisible: boolean;
  phoneVisible: boolean;
  addressVisible: boolean;
}
