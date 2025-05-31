
import { supabase } from "@/integrations/supabase/client";
import { SurveyFormData } from "@/components/onboarding/survey/types/surveyTypes";

/**
 * Hook for handling user account creation during onboarding
 * 
 * This handles the Supabase Auth signup process with proper error handling
 */
export const useAccountCreation = () => {
  /**
   * Create user account if they don't have one
   */
  const createUserAccount = async (formData: SurveyFormData): Promise<string | null> => {
    if (!formData.email || !formData.password) {
      throw new Error('Email and password are required for account creation');
    }

    try {
      console.log("[useAccountCreation] Creating user account for:", formData.email);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: `${formData.firstName} ${formData.lastName}`.trim()
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user account');

      console.log("[useAccountCreation] User account created successfully:", authData.user.id);
      return authData.user.id;
    } catch (error) {
      console.error('[useAccountCreation] Error creating user account:', error);
      throw new Error('Failed to create user account');
    }
  };

  return { createUserAccount };
};
