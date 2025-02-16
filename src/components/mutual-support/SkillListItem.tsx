
import { Circle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { SupportItem } from "./types";
import RequestScheduleDialog from "./RequestScheduleDialog";
import { useToast } from "@/hooks/use-toast";

interface SkillListItemProps {
  item: SupportItem;
  onClick: () => void;
}

const SkillListItem = ({ item, onClick }: SkillListItemProps) => {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const { toast } = useToast();
  const displayName = item.profiles?.display_name || item.originalRequest.profiles.display_name;
  
  const handleScheduleConfirm = (schedule: { days: string[]; timePreference: string[] }) => {
    toast({
      title: "Request scheduled",
      description: `Your request has been scheduled for ${schedule.days.join(", ")} during ${schedule.timePreference.join(", ")}`,
    });
    onClick();
  };

  const handleMeToo = () => {
    toast({
      title: "Added to your skills",
      description: "Others can now see that you also have this skill!",
    });
  };

  return (
    <>
      <div className="flex items-start gap-4 py-3 px-6 group hover:bg-gray-50 rounded-lg transition-colors">
        <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
          <AvatarFallback>
            {displayName?.[0] || <Circle className="h-4 w-4 text-gray-400" />}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleMeToo}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <Plus className="h-3 w-3 mr-1" />
                Me too
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsScheduleOpen(true)}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Request
              </Button>
            </div>
          </div>
        </div>
      </div>

      <RequestScheduleDialog
        open={isScheduleOpen}
        onOpenChange={setIsScheduleOpen}
        onConfirm={handleScheduleConfirm}
        displayName={displayName || ""}
      />
    </>
  );
};

export default SkillListItem;
