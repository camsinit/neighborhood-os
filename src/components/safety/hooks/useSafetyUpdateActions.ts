
/**
 * Custom hook for safety update actions
 * 
 * This hook centralizes all the actions related to safety updates like
 * deletion, opening dialogs, etc. to keep our components clean
 */
import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { refreshEvents } from "@/utils/refreshEvents";
import { createLogger } from "@/utils/logger";

// Create a logger for this hook
const logger = createLogger('useSafetyUpdateActions');

/**
 * Hook for managing safety update actions and state
 * Centralizes all the dialog state and CRUD operations
 */
export const useSafetyUpdateActions = () => {
  // State to control dialog visibility
  const [isAddUpdateOpen, setIsAddUpdateOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  
  // Get current user for permission checks
  const user = useUser();
  const queryClient = useQueryClient();

  /**
   * Handler for opening the add update dialog
   */
  const openAddUpdateDialog = () => setIsAddUpdateOpen(true);
  
  /**
   * Handler for opening the archive dialog
   */
  const openArchiveDialog = () => setIsArchiveOpen(true);

  /**
   * Handler for deleting safety updates
   * Confirms with the user and processes the deletion
   */
  const handleDeleteSafetyUpdate = async (updateId: string) => {
    if (!user) return;

    if (window.confirm("Are you sure you want to delete this safety update?")) {
      try {
        // Delete the update - database trigger will handle cleanup
        const { error } = await supabase
          .from('safety_updates')
          .delete()
          .eq('id', updateId)
          .eq('author_id', user.id);

        if (error) {
          logger.error("Error deleting safety update:", error);
          toast.error("Failed to delete safety update");
          return;
        }

        // Show success message and refresh data
        toast.success("Safety update deleted successfully");
        setSelectedUpdate(null);
        queryClient.invalidateQueries({ queryKey: ['safety-updates'] });
        
        // Signal refresh events
        refreshEvents.emit('safety-updated');
        refreshEvents.emit('notification-created');
        refreshEvents.emit('activities');
      } catch (err) {
        logger.error("Error in delete operation:", err);
        toast.error("An error occurred while deleting");
      }
    }
  };
  
  return {
    // Dialog states
    isAddUpdateOpen,
    setIsAddUpdateOpen,
    isArchiveOpen, 
    setIsArchiveOpen,
    selectedUpdate,
    setSelectedUpdate,
    
    // Action handlers
    openAddUpdateDialog,
    openArchiveDialog,
    handleDeleteSafetyUpdate
  };
};
