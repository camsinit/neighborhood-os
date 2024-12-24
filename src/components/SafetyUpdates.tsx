import { useState } from "react";
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
import { User } from "lucide-react";
import { format } from "date-fns";

const SafetyUpdates = () => {
  const [isAddUpdateOpen, setIsAddUpdateOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const { data: updates, isLoading } = useSafetyUpdates();
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Safety Updates</h2>
        <Button 
          onClick={() => setIsAddUpdateOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white h-10"
        >
          Post Update
        </Button>
      </div>
      
      <SafetyUpdatesList
        updates={updates || []}
        isLoading={isLoading}
        onUpdateClick={setSelectedUpdate}
      />

      <div className="mt-8 flex justify-center">
        <Button 
          variant="outline"
          onClick={() => setIsArchiveOpen(true)}
          className="w-full max-w-xs border-red-600 border-dotted hover:bg-gray-50"
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
            <DialogTitle>{selectedUpdate?.title}</DialogTitle>
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
    </div>
  );
};

export default SafetyUpdates;