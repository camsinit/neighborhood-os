
import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Interface for the database function response
 */
interface DeleteAccountResponse {
  success: boolean;
  error?: string;
  message?: string;
  deletion_log?: Record<string, number>;
}

/**
 * Hook for handling complete account deletion
 * 
 * This hook provides functionality to safely delete a user's account
 * and all associated data from the neighborhood platform.
 * 
 * Updated to comprehensively delete all user data while allowing re-registration.
 * 
 * Process:
 * 1. Calls the improved delete_user_account database function that now includes shared_items
 * 2. Signs out the user from Supabase Auth  
 * 3. Navigates to the landing page
 * 
 * Note: Users can re-register with the same email after deletion because we only
 * delete the profiles table, not the auth.users record (handled by Supabase).
 */
export const useAccountDeletion = () => {
  const user = useUser();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Delete the current user's account and all associated data
   * 
   * This function calls the comprehensive delete_user_account database function
   * that removes all user data including the previously missing shared_items.
   * Re-registration with the same email is supported after deletion.
   */
  const deleteAccount = async (): Promise<boolean> => {
    if (!user?.id) {
      toast.error("No user found to delete");
      return false;
    }

    console.log("[useAccountDeletion] Starting account deletion for user:", user.id);
    setIsDeleting(true);

    try {
      // Call the improved database function to delete all user data including shared_items
      const { data, error } = await supabase.rpc('delete_user_account', {
        target_user_id: user.id
      });

      if (error) {
        console.error("[useAccountDeletion] Database deletion error:", error);
        throw new Error(error.message);
      }

      // Safely convert the response to our expected type
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        console.error("[useAccountDeletion] Invalid response format:", data);
        throw new Error("Invalid response from deletion function");
      }

      const response = data as unknown as DeleteAccountResponse;

      if (!response.success) {
        console.error("[useAccountDeletion] Deletion failed:", response.error);
        throw new Error(response.error || "Account deletion failed");
      }

      console.log("[useAccountDeletion] Database deletion successful:", response.deletion_log);

      // Sign out the user from Supabase Auth
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.error("[useAccountDeletion] Sign out error:", signOutError);
        // Don't throw here - data is already deleted, just log the error
      }

      // Show success message - use the message from database response
      toast.success(response.message || "Your account and all data have been permanently deleted");

      // Navigate to landing page
      navigate("/");

      return true;
    } catch (error: any) {
      console.error("[useAccountDeletion] Error deleting account:", error);
      
      toast.error(
        error.message || "Failed to delete account. Please try again or contact support."
      );
      
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteAccount,
    isDeleting,
  };
};
