
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
 * Updated to work with the fixed database function that only references existing tables.
 * 
 * Process:
 * 1. Calls the fixed delete_user_account database function
 * 2. Signs out the user from Supabase Auth
 * 3. Navigates to the landing page
 */
export const useAccountDeletion = () => {
  const user = useUser();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Delete the current user's account and all associated data
   * 
   * This function now works with the corrected database function that only
   * deletes from tables that actually exist in the database.
   */
  const deleteAccount = async (): Promise<boolean> => {
    if (!user?.id) {
      toast.error("No user found to delete");
      return false;
    }

    console.log("[useAccountDeletion] Starting account deletion for user:", user.id);
    setIsDeleting(true);

    try {
      // Call the fixed database function to delete all user data
      // This function now properly handles only existing tables
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

      // Show success message
      toast.success("Your account and all data have been permanently deleted");

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
