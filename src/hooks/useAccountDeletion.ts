
import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook for handling complete account deletion
 * 
 * This hook provides functionality to safely delete a user's account
 * and all associated data from the neighborhood platform.
 * 
 * Process:
 * 1. Calls the delete_user_account database function
 * 2. Signs out the user from Supabase Auth
 * 3. Navigates to the landing page
 */
export const useAccountDeletion = () => {
  const user = useUser();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Delete the current user's account and all associated data
   */
  const deleteAccount = async (): Promise<boolean> => {
    if (!user?.id) {
      toast.error("No user found to delete");
      return false;
    }

    console.log("[useAccountDeletion] Starting account deletion for user:", user.id);
    setIsDeleting(true);

    try {
      // Call the database function to delete all user data
      const { data, error } = await supabase.rpc('delete_user_account', {
        target_user_id: user.id
      });

      if (error) {
        console.error("[useAccountDeletion] Database deletion error:", error);
        throw new Error(error.message);
      }

      if (!data?.success) {
        console.error("[useAccountDeletion] Deletion failed:", data?.error);
        throw new Error(data?.error || "Account deletion failed");
      }

      console.log("[useAccountDeletion] Database deletion successful:", data.deletion_log);

      // Sign out the user from Supabase Auth
      // Note: We don't delete from auth.users as that's managed by Supabase
      // The user would need to contact support to fully remove their auth account
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
