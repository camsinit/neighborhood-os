
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AddSafetyUpdateDialog from "./AddSafetyUpdateDialog";
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

const SafetyUpdates = () => {
  const [isAddUpdateOpen, setIsAddUpdateOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const { data: updates, isLoading } = useSafetyUpdates();
  const user = useUser();

  useEffect(() => {
    const handleOpenSafetyDialog = (event: CustomEvent<{ id: string }>) => {
      const update = updates?.find(u => u.id === event.detail.id);
      if (update) {
        setSelectedUpdate(update);
      }
    };

    window.addEventListener('opensafetyDialog', handleOpenSafetyDialog as EventListener);
    
    return () => {
      window.removeEventListener('opensafetyDialog', handleOpenSafetyDialog as EventListener);
    };
  }, [updates]);
  
  return (
    <>
      <Button 
        data-add-update-button
        className="hidden"
        onClick={() => setIsAddUpdateOpen(true)}
      >
        Post Update
      </Button>
      
      <div className="bg-transparent">
        <SafetyUpdatesList
          updates={updates || []}
          isLoading={isLoading}
          onUpdateClick={setSelectedUpdate}
        />
      </div>

      <div className="mt-8 flex justify-center">
        <Button 
          variant="outline"
          onClick={() => setIsArchiveOpen(true)}
          className="w-full max-w-xs border-amber-500 border-dotted hover:bg-amber-50"
        >
          Archive
        </Button>
      </div>

      <AddSafetyUpdateDialog 
        open={isAddUpdateOpen}
        onOpenChange={setIsAddUpdateOpen}
      />
      <SafetyArchiveDialog
        open={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
      />
      
      <Dialog open={!!selectedUpdate} onOpenChange={() => setSelectedUpdate(null)}>
        <DialogContent className="sm:max-w-[600px]">
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
