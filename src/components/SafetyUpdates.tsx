
/**
 * SafetyUpdates.tsx
 * 
 * Main component for the Community Updates feature.
 * Presents a list of updates and handles dialog interactions.
 */
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import SafetyArchiveDialog from "./SafetyArchiveDialog";
import { useSafetyUpdates } from "@/utils/queries/useSafetyUpdates";
import SafetyUpdatesList from "./safety/SafetyUpdatesList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUser } from "@supabase/auth-helpers-react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import AddSafetyUpdateDialogNew from "./safety/AddSafetyUpdateDialogNew";
import { createLogger } from "@/utils/logger";
import { useSafetyUpdateActions } from "./safety/hooks/useSafetyUpdateActions";
import SafetyUpdateDetail from "./safety/detail/SafetyUpdateDetail";

// Create a logger for this component
const logger = createLogger('SafetyUpdates');

/**
 * SafetyUpdates component displays a list of community updates
 * and provides functionality to create, view, and edit updates
 */
const SafetyUpdates = () => {
  // Use our custom hook for safety update actions
  const {
    isAddUpdateOpen,
    setIsAddUpdateOpen,
    isArchiveOpen,
    setIsArchiveOpen,
    selectedUpdate,
    setSelectedUpdate,
    openAddUpdateDialog,
    openArchiveDialog,
    handleDeleteSafetyUpdate
  } = useSafetyUpdateActions();
  
  // Fetch updates data
  const { data: safetyUpdatesResponse, isLoading } = useSafetyUpdates();
  // Extract the data array safely, ensuring it's always an array even if there's an error
  const safetyUpdates = safetyUpdatesResponse?.data || [];
  
  // Get current user for permission checks
  const user = useUser();

  // Set up auto-refresh for updates data
  useAutoRefresh(['safety-updates'], ['safety-update-submitted', 'safety-updated']);

  // Handle custom events for opening safety dialogs
  useEffect(() => {
    const handleOpenSafetyDialog = (event: CustomEvent<{ id: string }>) => {
      // Find the update by ID and select it
      const update = safetyUpdates.find(u => u.id === event.detail.id);
      if (update) {
        setSelectedUpdate(update);
      }
    };

    // Add event listener for custom dialog opening event
    window.addEventListener('opensafetyDialog', handleOpenSafetyDialog as EventListener);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('opensafetyDialog', handleOpenSafetyDialog as EventListener);
    };
  }, [safetyUpdates, setSelectedUpdate]);
  
  return (
    <>
      {/* Updates list with improved empty state and relocated button */}
      <div className="bg-transparent">
        <SafetyUpdatesList
          updates={safetyUpdates}
          isLoading={isLoading}
          onUpdateClick={setSelectedUpdate}
          onAddUpdate={openAddUpdateDialog}
        />
      </div>

      {/* Archive button */}
      <div className="mt-8 flex justify-center">
        <Button 
          variant="outline"
          onClick={openArchiveDialog}
          className="w-full max-w-xs border-blue-500 border-dotted hover:bg-blue-50 rounded-md"
        >
          View Archive
        </Button>
      </div>

      {/* Update Dialog */}
      <AddSafetyUpdateDialogNew 
        open={isAddUpdateOpen}
        onOpenChange={setIsAddUpdateOpen}
      />
      
      {/* Archive dialog */}
      <SafetyArchiveDialog
        open={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
      />
      
      {/* Detail view dialog for a selected update */}
      <Dialog 
        open={!!selectedUpdate} 
        onOpenChange={() => setSelectedUpdate(null)}
      >
        <DialogContent className="sm:max-w-[600px] bg-white p-6 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle>Community Update</DialogTitle>
          </DialogHeader>
          
          {selectedUpdate && (
            <SafetyUpdateDetail 
              update={selectedUpdate} 
              onDelete={handleDeleteSafetyUpdate} 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SafetyUpdates;
