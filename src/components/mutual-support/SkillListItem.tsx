
import { Circle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SupportItem } from "./types";

interface SkillListItemProps {
  item: SupportItem;
  onClick: () => void;
}

const SkillListItem = ({ item, onClick }: SkillListItemProps) => {
  return (
    <div className="flex items-start justify-between py-4 group hover:bg-gray-50 px-4 rounded-lg transition-colors">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 mt-1">
          <AvatarFallback>
            {item.profiles?.display_name?.[0] || <Circle className="h-5 w-5 text-gray-400" />}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
          <p className="text-gray-500 text-base">{item.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-gray-400" />
        <Button 
          variant="outline" 
          size="sm"
          onClick={onClick}
          className="border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          Request
        </Button>
      </div>
    </div>
  );
};

export default SkillListItem;
