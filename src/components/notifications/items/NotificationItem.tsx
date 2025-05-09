
import { cn } from "@/lib/utils";
import { BaseNotification } from "@/hooks/notifications/types";
import { format } from "date-fns";
import { 
  AlertTriangle, 
  Bell, 
  Calendar, 
  CheckCircle, 
  MessageSquare, 
  ShoppingCart, 
  UserPlus 
} from "lucide-react";
import { HighlightableItemType } from "@/utils/highlightNavigation";
import { highlightItem } from "@/utils/highlightNavigation";

/**
 * Enhanced NotificationItem component with better visual design and context
 * 
 * @param notification - The notification data to display
 * @param onSelect - Optional callback when the notification is selected
 */
interface NotificationItemProps {
  notification: BaseNotification;
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

  // Get icon based on notification type
  const getTypeIcon = () => {
    // First validate that notification.notification_type is a valid HighlightableItemType
    const notificationType = notification.notification_type;
    
    switch (notificationType) {
      case "safety":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "event":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "skills":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "goods":
        return <ShoppingCart className="h-5 w-5 text-orange-500" />;
      case "neighbors":
        return <UserPlus className="h-5 w-5 text-teal-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get the name of the person who caused this notification
  const getActorName = () => {
    if (notification.context?.neighborName) {
      return notification.context.neighborName;
    }
    return "Someone";
  };

  // Generate a more descriptive message based on notification type
  const getDescriptiveMessage = () => {
    const actorName = getActorName();
    
    switch (notification.notification_type) {
      case "event":
        return `${actorName} created an event: "${notification.title}"`;
      case "safety":
        return `Safety alert: "${notification.title}"`;
      case "skills":
        if (notification.context?.contextType === "skill_request") {
          return `${actorName} requested your skill: "${notification.title}"`;
        }
        return `New skill offering: "${notification.title}"`;
      case "goods":
        if (notification.context?.contextType === "goods_offer") {
          return `${actorName} is offering: "${notification.title}"`;
        }
        return `${actorName} is looking for: "${notification.title}"`;
      case "neighbors":
        return `${actorName} joined your neighborhood`;
      default:
        return notification.title;
    }
  };

  // Handle click on the notification item
  const handleClick = () => {
    // Call the onSelect callback if provided
    if (onSelect) {
      onSelect();
    }
    
    // Navigate to the item if we have a valid notification type and content ID
    if (
      notification.notification_type && 
      notification.content_id &&
      // Check if notification_type is a valid HighlightableItemType
      ["safety", "event", "skills", "goods", "neighbors"].includes(notification.notification_type)
    ) {
      // Cast the type to HighlightableItemType since we've verified it's valid
      const notificationType = notification.notification_type as HighlightableItemType;
      
      // Use the highlightItem utility to navigate and highlight the item
      highlightItem(
        notificationType, 
        notification.content_id,
        true // Show toast notification
      );
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
        getRelevanceStyles(notification.relevance_score),
        !notification.is_read && "font-medium border-l-4 border-l-blue-500"
      )}
      onClick={handleClick}
    >
      {/* Icon section */}
      <div className="flex-shrink-0 mt-1">
        {getTypeIcon()}
      </div>
      
      {/* Content section */}
      <div className="flex-1">
        {/* Header with time */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">
            {format(new Date(notification.created_at), 'MMM d, h:mm a')}
          </span>
        </div>
        
        {/* Main message */}
        <p className="text-sm mb-1">{getDescriptiveMessage()}</p>
        
        {/* Action hint */}
        <p className="text-xs text-gray-500 mt-1">Click to view</p>
      </div>
    </div>
  );
}
