
import { Circle } from "lucide-react";
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

  return (
    <>
      <div className="flex items-start justify-between py-4 group hover:bg-gray-50 px-8 rounded-lg transition-colors">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 mt-1">
            <AvatarFallback>
              {displayName?.[0] || <Circle className="h-5 w-5 text-gray-400" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
            <p className="text-gray-500 text-base">{item.description}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsScheduleOpen(true)}
          className="border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          Request
        </Button>
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
