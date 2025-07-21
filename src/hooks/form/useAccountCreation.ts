
import { supabase } from "@/integrations/supabase/client";
import { SurveyFormData } from "@/components/onboarding/survey/types/surveyTypes";
import { queueEmail, queueOnboardingSeries } from "@/utils/email/emailQueue";

/**
 * Hook for handling user account creation during onboarding
 * 
 * This handles the Supabase Auth signup process with proper error handling
 */
export const useAccountCreation = () => {
  /**
   * Create user account if they don't have one and queue welcome emails
   */
  const createUserAccount = async (
    formData: SurveyFormData, 
    neighborhoodName?: string, 
    neighborhoodId?: string
  ): Promise<string | null> => {
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

      // Queue welcome email and onboarding series if neighborhood info is provided
      if (neighborhoodName && neighborhoodId) {
        console.log("[useAccountCreation] Queueing welcome email and onboarding series");
        
        // Queue immediate welcome email
        const welcomeResult = await queueEmail({
          recipient_email: formData.email,
          template_type: 'welcome',
          template_data: {
            firstName: formData.firstName,
            neighborhoodName: neighborhoodName
          },
          scheduled_for: new Date(), // Send immediately
          neighborhood_id: neighborhoodId,
          user_id: authData.user.id
        });

        if (!welcomeResult.success) {
          console.error("[useAccountCreation] Failed to queue welcome email:", welcomeResult.error);
          // Don't fail account creation if email queueing fails
        }

        // Queue 7-part onboarding series
        const onboardingResult = await queueOnboardingSeries(
          formData.email,
          formData.firstName,
          neighborhoodName,
          neighborhoodId,
          authData.user.id
        );

        if (!onboardingResult.success) {
          console.error("[useAccountCreation] Failed to queue onboarding series:", onboardingResult.error);
          // Don't fail account creation if email queueing fails
        }
      }

      return authData.user.id;
    } catch (error) {
      console.error('[useAccountCreation] Error creating user account:', error);
      
      // Handle specific error cases with more helpful messages
      if (error instanceof Error) {
        if (error.message.includes('User already registered') || error.message.includes('already been registered')) {
          throw new Error('An account with this email already exists. Please try signing in instead.');
        }
        if (error.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.');
        }
        if (error.message.includes('Password')) {
          throw new Error('Password does not meet requirements. Please check the password criteria.');
        }
      }
      
      // Fallback to generic error message
      throw new Error('Failed to create user account. Please try again.');
    }
  };

  return { createUserAccount };
};
