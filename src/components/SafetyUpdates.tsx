
import { useState, useEffect } from "react";
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
import { SafetyUpdateComments } from "./safety/SafetyUpdateComments";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Pencil } from "lucide-react";
import { format } from "date-fns";
import EditSafetyUpdateDialog from "./safety/EditSafetyUpdateDialog";
import { useUser } from "@supabase/auth-helpers-react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import AddSafetyUpdateDialogNew from "./safety/AddSafetyUpdateDialogNew"; // Import the new dialog component

/**
 * SafetyUpdates component displays a list of safety updates for the neighborhood
 * and provides functionality to create, view, and edit updates
 */
const SafetyUpdates = () => {
  // State to control dialog visibility
  const [isAddUpdateOpen, setIsAddUpdateOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  
  // Fetch safety updates data
  const { data: safetyUpdatesResponse, isLoading } = useSafetyUpdates();
  // Extract the data array safely, ensuring it's always an array even if there's an error
  const safetyUpdates = safetyUpdatesResponse?.data || [];
  
  // Get current user for permission checks
  const user = useUser();

  // Set up auto-refresh for safety updates data
  // This will listen for the safety-update-submitted event and refresh the data
  useAutoRefresh(['safety-updates'], ['safety-update-submitted']);

  // Handle custom events for opening safety dialogs
  useEffect(() => {
    const handleOpenSafetyDialog = (event: CustomEvent<{ id: string }>) => {
      // Now we're safely working with the array of updates
      const update = safetyUpdates.find(u => u.id === event.detail.id);
      if (update) {
        setSelectedUpdate(update);
      }
    };

    window.addEventListener('opensafetyDialog', handleOpenSafetyDialog as EventListener);
    
    return () => {
      window.removeEventListener('opensafetyDialog', handleOpenSafetyDialog as EventListener);
    };
  }, [safetyUpdates]); // Use the array directly
  
  return (
    <>
      {/* Safety updates list with improved empty state and relocated button */}
      <div className="bg-transparent">
        <SafetyUpdatesList
          updates={safetyUpdates}
          isLoading={isLoading}
          onUpdateClick={setSelectedUpdate}
          onAddUpdate={() => setIsAddUpdateOpen(true)} // Pass the function to open the dialog
        />
      </div>

      {/* Archive button */}
      <div className="mt-8 flex justify-center">
        <Button 
          variant="outline"
          onClick={() => setIsArchiveOpen(true)}
          className="w-full max-w-xs border-amber-500 border-dotted hover:bg-amber-50"
        >
          Archive
        </Button>
      </div>

      {/* Safety Update Dialog */}
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
      <Dialog open={!!selectedUpdate} onOpenChange={() => setSelectedUpdate(null)}>
        <DialogContent className="sm:max-w-[600px] bg-white p-6 rounded-lg shadow-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{selectedUpdate?.title}</DialogTitle>
              {user && user.id === selectedUpdate?.author_id && (
                <EditSafetyUpdateDialog update={selectedUpdate}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="hover:bg-secondary"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </EditSafetyUpdateDialog>
              )}
            </div>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={selectedUpdate?.profiles?.avatar_url || ''} 
                  alt={selectedUpdate?.profiles?.display_name || 'User'} 
                />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedUpdate?.profiles?.display_name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedUpdate?.created_at && format(new Date(selectedUpdate.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <p className="text-gray-700">{selectedUpdate?.description}</p>
            {selectedUpdate && (
              <SafetyUpdateComments updateId={selectedUpdate.id} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SafetyUpdates;
