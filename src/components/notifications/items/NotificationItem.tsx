import { cn } from "@/lib/utils";
import { BaseNotification } from "@/hooks/notifications/types";
import { format } from "date-fns";
import { AlertTriangle, Calendar, CheckCircle, MessageSquare, ShoppingCart, UserPlus } from "lucide-react";

interface NotificationItemProps {
  notification: BaseNotification & { relevance_score?: number };
  onSelect?: () => void;
}

export function NotificationItem({ notification, onSelect }: NotificationItemProps) {
  // Helper function to get relevance-based styles
  const getRelevanceStyles = (score?: number) => {
    switch (score) {
      case 3: // High relevance
        return "bg-red-50 border-red-200 hover:bg-red-100";
      case 2: // Medium relevance
        return "bg-yellow-50 border-yellow-200 hover:bg-yellow-100";
      default: // Low relevance or undefined
        return "bg-gray-50 border-gray-200 hover:bg-gray-100";
    }
  };

  // Get icon based on notification type (you can expand this)
  const getTypeIcon = () => {
    switch (notification.type) {
      case "safety":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "event":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "support":
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case "skills":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "goods":
        return <ShoppingCart className="h-5 w-5 text-orange-500" />;
      case "neighbors":
        return <UserPlus className="h-5 w-5 text-teal-500" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
        getRelevanceStyles(notification.relevance_score),
        !notification.is_read && "font-medium"
      )}
      onClick={onSelect}
    >
      {getTypeIcon()}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {format(new Date(notification.created_at), 'MMM d, h:mm a')}
          </span>
        </div>
        <p className="text-sm mt-1">{notification.title}</p>
      </div>
    </div>
  );
}
