
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Construction, Eye, User } from "lucide-react";
import { format } from "date-fns";

interface SafetyUpdateCardProps {
  update: any;
  onClick: () => void;
}

const SafetyUpdateCard = ({ update, onClick }: SafetyUpdateCardProps) => {
  // Helper function to get tag color based on type
  const getTypeStyles = (type: string) => {
    switch (type) {
      case "Alert":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          icon: AlertTriangle,
          border: "border-red-200"
        };
      case "Maintenance":
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-700",
          icon: Construction,
          border: "border-yellow-200"
        };
      case "Observation":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          icon: Eye,
          border: "border-blue-200"
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          icon: Eye,
          border: "border-gray-200"
        };
    }
  };

  const typeStyles = getTypeStyles(update.type);
  const IconComponent = typeStyles.icon;

  return (
    <Card 
      className={`p-4 cursor-pointer hover:shadow-md transition-all duration-300 border-l-4 ${typeStyles.border}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={update.profiles?.avatar_url} alt={update.profiles?.display_name || 'User'} />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {update.title}
            </h3>
            <span 
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeStyles.bg} ${typeStyles.text}`}
            >
              <IconComponent className="w-3 h-3 mr-1" />
              {update.type}
            </span>
          </div>

          <p className="text-sm text-gray-500 line-clamp-2 mb-2">
            {update.description}
          </p>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-medium">{update.profiles?.display_name}</span>
            <span>•</span>
            <span>{format(new Date(update.created_at), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>

      {update.imageUrl && (
        <div className="mt-3">
          <img 
            src={update.imageUrl} 
            alt={update.title}
            className="rounded-lg w-full h-48 object-cover" 
          />
        </div>
      )}
    </Card>
  );
};

export default SafetyUpdateCard;
