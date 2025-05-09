
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
import { getNotificationStyle, getTimeAgo } from "../utils/notificationStyles";
import { Badge } from "@/components/ui/badge";

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
  // Get notification style based on type
  const style = getNotificationStyle(notification.notification_type);
  const Icon = style.icon;

  // Helper function to get relevance-based styles
  const getRelevanceStyles = (score?: number) => {
    switch (score) {
      case 3: // High relevance
        return "bg-red-50 border-red-200 hover:bg-red-100";
      case 2: // Medium relevance
        return "bg-yellow-50 border-yellow-200 hover:bg-yellow-100";
      default: // Low relevance or undefined
        return style.backgroundColor + " " + style.hoverColor;
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

  // Get a formatted time string
  const getFormattedTime = () => {
    const timeAgo = getTimeAgo(notification.created_at);
    const fullDate = format(new Date(notification.created_at), "MMM d, h:mm a");
    
    return { timeAgo, fullDate };
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

  // Format time display
  const { timeAgo, fullDate } = getFormattedTime();

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
        getRelevanceStyles(notification.relevance_score),
        !notification.is_read && "font-medium border-l-4", 
        !notification.is_read && style.borderColor
      )}
      onClick={handleClick}
      title={fullDate} // Show full timestamp on hover
    >
      {/* Icon section */}
      <div className="flex-shrink-0 mt-1">
        {notification.context?.avatarUrl ? (
          <div className="h-9 w-9 rounded-full overflow-hidden border border-gray-200">
            <img 
              src={notification.context.avatarUrl} 
              alt={notification.context.neighborName || ''}
              className="h-full w-full object-cover" 
            />
          </div>
        ) : (
          <div className={`p-2 rounded-full ${style.backgroundColor}`}>
            <Icon className={`h-5 w-5 ${style.textColor}`} />
          </div>
        )}
      </div>
      
      {/* Content section */}
      <div className="flex-1 space-y-1">
        {/* Header with metadata */}
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs ${notification.is_read ? 'text-gray-400' : 'text-gray-500 font-medium'}`}>
            {timeAgo}
          </span>
          
          {/* Only show status badge for unread high priority items */}
          {!notification.is_read && notification.relevance_score === 3 && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-auto">
              Action needed
            </Badge>
          )}
        </div>
        
        {/* Main message with context */}
        <p className={cn(
          "text-sm leading-snug", 
          notification.is_read ? "text-gray-600" : style.textColor
        )}>
          {getDescriptiveMessage()}
        </p>
        
        {/* Additional context if available */}
        {notification.context?.summary && (
          <p className="text-xs text-gray-500 mt-0.5 italic">
            {notification.context.summary}
          </p>
        )}
        
        {/* Action hint */}
        <p className="text-xs text-gray-400 mt-1">
          {notification.context?.actionRequired ? "Click to respond" : "Click to view"}
        </p>
      </div>
    </div>
  );
}
