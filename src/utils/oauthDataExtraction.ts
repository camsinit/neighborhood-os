import { User } from "@supabase/supabase-js";
import { SurveyFormData } from "@/components/onboarding/survey/types/surveyTypes";

/**
 * OAuth Data Extraction Utility
 * 
 * Extracts user profile data from OAuth providers (Google, etc.)
 * and creates a pre-populated SurveyFormData object.
 */

/**
 * Extract OAuth user data and create a pre-populated form data object
 * 
 * @param user The authenticated Supabase user object
 * @returns Partial SurveyFormData with OAuth data pre-populated
 */
export const extractOAuthUserData = (user: User): Partial<SurveyFormData> => {
  const userMetadata = user.user_metadata;
  
  // Extract name components - handle different OAuth provider formats
  const fullName = userMetadata.full_name || userMetadata.name || '';
  const nameParts = fullName.split(' ');
  const firstName = userMetadata.given_name || userMetadata.first_name || nameParts[0] || '';
  const lastName = userMetadata.family_name || userMetadata.last_name || nameParts.slice(1).join(' ') || '';
  
  return {
    authMethod: 'oauth',
    isDataPrePopulated: true,
    firstName,
    lastName,
    email: user.email || '',
    profileImageUrl: userMetadata.avatar_url || userMetadata.picture || '',
    address: '', // User will need to provide this
    yearMovedIn: null, // User will need to provide this
  };
};

/**
 * Create a default manual signup form data object
 * 
 * @returns Complete SurveyFormData for manual signup
 */
export const createManualSignupFormData = (): SurveyFormData => {
  return {
    authMethod: 'manual',
    isDataPrePopulated: false,
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    yearMovedIn: null,
    agreements: {
      communication: false,
      authenticity: false,
      followThrough: false,
      respectfulness: false,
    },
    password: '',
    contactPreference: 'email'
  };
};

/**
 * Check if user signed up via OAuth by examining their metadata
 * 
 * @param user The authenticated Supabase user object
 * @returns true if user used OAuth, false otherwise
 */
export const isOAuthUser = (user: User): boolean => {
  // Check if user has OAuth provider metadata
  const providers = user.app_metadata?.providers || [];
  return providers.some((provider: string) => provider !== 'email');
};

/**
 * Merge OAuth data with existing form data (useful for form updates)
 * 
 * @param existingData Current form data
 * @param user Authenticated user object
 * @returns Merged form data with OAuth data taking precedence for supported fields
 */
export const mergeOAuthData = (existingData: SurveyFormData, user: User): SurveyFormData => {
  if (!isOAuthUser(user)) {
    return existingData;
  }
  
  const oauthData = extractOAuthUserData(user);
  
  return {
    ...existingData,
    ...oauthData,
    // Preserve user-entered data for fields OAuth doesn't provide
    address: existingData.address,
    yearMovedIn: existingData.yearMovedIn,
  } as SurveyFormData;
};