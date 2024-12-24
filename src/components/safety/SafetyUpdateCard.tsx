import { AlertTriangle, Bell, Clock, Wrench, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import EditSafetyUpdateDialog from "./EditSafetyUpdateDialog";

interface SafetyUpdateCardProps {
  update: any;
  onClick: () => void;
}

const SafetyUpdateCard = ({ update, onClick }: SafetyUpdateCardProps) => {
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

  const UpdateIcon = getUpdateIcon(update.type);
  const colors = getUpdateColors(update.type);

  return (
    <div 
      className={`group bg-white border-l-4 ${colors.borderColor} rounded-lg p-3 pt-2 pb-6 shadow-sm hover:scale-[1.02] transition-all duration-200 ease-in-out relative cursor-pointer`}
      onClick={onClick}
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
      <div className="flex items-center gap-3 mb-3">
        <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${colors.color} ${colors.bgColor} text-sm font-medium`}>
          <UpdateIcon className="h-4 w-4 mr-2" />
          {update.type}
        </div>
        <span className="text-sm text-muted-foreground">
          {format(new Date(update.created_at), 'MMM d, yyyy')}
        </span>
      </div>
      <h4 className="text-lg font-medium mb-3">{update.title}</h4>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {update.description}
      </p>
      <div className="absolute bottom-2 right-3">
        <EditSafetyUpdateDialog update={update} />
      </div>
    </div>
  );
};

export default SafetyUpdateCard;