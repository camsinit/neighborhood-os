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
import { User, Pencil, Trash2, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import EditSafetyUpdateDialog from "./safety/EditSafetyUpdateDialog";
import { useUser } from "@supabase/auth-helpers-react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import AddSafetyUpdateDialogNew from "./safety/AddSafetyUpdateDialogNew";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { unifiedEvents } from "@/utils/unifiedEventSystem"; // Updated import
import { createLogger } from "@/utils/logger";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Create a logger for this component
const logger = createLogger('SafetyUpdates');

/**
 * SafetyUpdates component displays a list of safety updates for the neighborhood
 * and provides functionality to create, view, and edit updates
 * Now uses database triggers for notifications
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
  useAutoRefresh(['safety-updates'], ['safety-update-submitted', 'safety-updated']);

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

  const queryClient = useQueryClient();

  // Handler for deleting safety updates
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

        toast.success("Safety update deleted successfully");
        setSelectedUpdate(null);
        queryClient.invalidateQueries({ queryKey: ['safety-updates'] });
        
        // Signal refresh events using unified system
        unifiedEvents.emitMultiple(['safety', 'activities', 'notifications']);
      } catch (err) {
        logger.error("Error in delete operation:", err);
        toast.error("An error occurred while deleting");
      }
    }
  };

  // Helper function to get safety type badge styling
  const getSafetyTypeBadge = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'emergency':
        return { label: 'Emergency', variant: 'destructive' as const, icon: AlertTriangle };
      case 'alert':
        return { label: 'Alert', variant: 'secondary' as const, icon: AlertTriangle };
      case 'info':
        return { label: 'Information', variant: 'outline' as const, icon: Clock };
      default:
        return { label: 'Update', variant: 'outline' as const, icon: Clock };
    }
  };
  
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
      
      {/* Redesigned detail view dialog for a selected update with fixed height and scroll */}
      <Dialog open={!!selectedUpdate} onOpenChange={() => setSelectedUpdate(null)}>
        <DialogContent className="sm:max-w-[700px] bg-white rounded-xl shadow-xl border-0 p-0 overflow-hidden max-h-[90vh] flex flex-col">
          {/* Header section with improved design - fixed at top */}
          <DialogHeader className="px-8 pt-8 pb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Safety type badge */}
                {selectedUpdate?.type && (
                  <div className="mb-3">
                    {(() => {
                      const badgeConfig = getSafetyTypeBadge(selectedUpdate.type);
                      const IconComponent = badgeConfig.icon;
                      return (
                        <Badge variant={badgeConfig.variant} className="gap-1.5 px-3 py-1">
                          <IconComponent className="h-3.5 w-3.5" />
                          {badgeConfig.label}
                        </Badge>
                      );
                    })()}
                  </div>
                )}
                
                {/* Title with better typography */}
                <DialogTitle className="text-2xl font-bold text-gray-900 leading-tight mb-4 pr-4">
                  {selectedUpdate?.title}
                </DialogTitle>
                
                {/* Author and date info with improved layout */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      <AvatarImage 
                        src={selectedUpdate?.profiles?.avatar_url || ''} 
                        alt={selectedUpdate?.profiles?.display_name || 'User'} 
                      />
                      <AvatarFallback className="bg-amber-100 text-amber-800">
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900 text-base">
                        {selectedUpdate?.profiles?.display_name || 'Anonymous'}
                      </p>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {selectedUpdate?.created_at && format(new Date(selectedUpdate.created_at), 'MMM d, yyyy • h:mm a')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons for author */}
              {user && user.id === selectedUpdate?.author_id && (
                <div className="flex items-center gap-2 ml-4">
                  <EditSafetyUpdateDialog update={selectedUpdate}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-white hover:bg-gray-50 border-gray-200"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </EditSafetyUpdateDialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSafetyUpdate(selectedUpdate.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>
          
          {/* Scrollable content section */}
          <ScrollArea className="flex-1 h-0">
            <div className="px-8 py-6">
              {/* Description with improved typography */}
              {selectedUpdate?.description && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedUpdate.description}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Separator before comments */}
              <Separator className="mb-6" />
              
              {/* Comments section with improved design */}
              {selectedUpdate && (
                <div className="bg-white">
                  <SafetyUpdateComments updateId={selectedUpdate.id} />
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SafetyUpdates;
