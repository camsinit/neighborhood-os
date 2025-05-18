
/**
 * API utility for claiming a skill request
 * 
 * This function calls the claim_skill_request database function to allow
 * a provider to claim a skill request that was sent to multiple providers.
 */
import { supabase } from "@/integrations/supabase/client";

interface ClaimSkillRequestResult {
  success: boolean;
  message: string;
  sessionId?: string;
}

/**
 * Claims a skill request for the current user
 * 
 * @param sessionId - The ID of the skill session to claim
 * @returns A result object with success status and message
 */
export async function claimSkillRequest(sessionId: string): Promise<ClaimSkillRequestResult> {
  try {
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      return {
        success: false,
        message: "You must be logged in to claim a skill request"
      };
    }
    
    const providerId = userData.user.id;
    
    // Call the claim_skill_request database function
    const { data, error } = await supabase.rpc(
      'claim_skill_request',
      {
        p_session_id: sessionId,
        p_provider_id: providerId
      }
    );
    
    if (error) {
      console.error("Error claiming skill request:", error);
      return {
        success: false,
        message: error.message || "Failed to claim skill request"
      };
    }
    
    // Return the result from the database function
    return {
      success: data.success,
      message: data.message,
      sessionId: data.session_id
    };
  } catch (error: any) {
    console.error("Exception in claimSkillRequest:", error);
    return {
      success: false,
      message: error.message || "An unexpected error occurred"
    };
  }
}
