import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Bell, Wrench, Clock, User } from "lucide-react";
import AddSafetyUpdateDialog from "./AddSafetyUpdateDialog";
import SafetyArchiveDialog from "./SafetyArchiveDialog";
import { useSafetyUpdates } from "@/utils/queries/useSafetyUpdates";
import { Skeleton } from "./ui/skeleton";
import EditSafetyUpdateDialog from "./safety/EditSafetyUpdateDialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SafetyUpdateComments } from "./safety/SafetyUpdateComments";

const SafetyUpdates = () => {
  const [isAddUpdateOpen, setIsAddUpdateOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const { data: updates, isLoading } = useSafetyUpdates();
  
  const categories = [
    { icon: Clock, label: "Updates" },
    { icon: Bell, label: "Alerts" },
    { icon: Wrench, label: "Maintenance" },
  ];

  const getUpdateIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'alerts':
        return AlertTriangle;
      case 'maintenance':
        return Wrench;
      default:
        return Clock;
    }
  };

  const getUpdateColors = (type: string) => {
    switch (type.toLowerCase()) {
      case 'alerts':
        return {
          color: "text-red-500",
          bgColor: "bg-red-100",
          borderColor: "border-l-red-500",
        };
      case 'maintenance':
        return {
          color: "text-blue-500",
          bgColor: "bg-blue-100",
          borderColor: "border-l-blue-500",
        };
      default:
        return {
          color: "text-green-500",
          bgColor: "bg-green-100",
          borderColor: "border-l-green-500",
        };
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
          <Skeleton className="h-6 w-32 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );

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
      <div className="flex items-center gap-6 mb-8">
        <Input 
          type="search" 
          placeholder="Search safety updates..." 
          className="max-w-sm bg-white border-gray-200 focus:ring-gray-200 focus:border-gray-300 h-10" 
        />
        <div className="flex gap-4">
          {categories.map((cat) => (
            <Button 
              key={cat.label} 
              variant="outline" 
              className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-200 h-10"
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        {isLoading ? (
          renderSkeleton()
        ) : (
          updates?.map((update) => {
            const UpdateIcon = getUpdateIcon(update.type);
            const colors = getUpdateColors(update.type);
            return (
              <div 
                key={update.id} 
                className={`group bg-white border-l-4 ${colors.borderColor} rounded-lg p-3 pt-2 pb-6 shadow-sm hover:scale-[1.02] transition-all duration-200 ease-in-out relative cursor-pointer`}
                onClick={() => setSelectedUpdate(update)}
              >
                <div className="absolute top-3 right-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={update.profiles?.avatar_url || ''} 
                      alt={update.profiles?.display_name || 'User'} 
                    />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${colors.color} ${colors.bgColor} text-sm font-medium mb-3`}>
                  <UpdateIcon className="h-4 w-4 mr-2" />
                  {update.type}
                </div>
                <h4 className="text-lg font-medium mb-3">{update.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {update.description}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>{update.profiles?.display_name}</span>
                    <span>{new Date(update.created_at).toLocaleDateString()}</span>
                  </div>
                  <EditSafetyUpdateDialog update={update} />
                </div>
              </div>
            );
          })
        )}
      </div>
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
                  {selectedUpdate?.created_at && new Date(selectedUpdate.created_at).toLocaleDateString()}
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