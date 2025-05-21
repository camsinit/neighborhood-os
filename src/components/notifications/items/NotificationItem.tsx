
/**
 * Minimalist NotificationItem component
 * 
 * This component presents notifications with a clean, user-focused design
 * that prioritizes the person, action, and content with minimal space usage
 */
import React, { useState, useRef, useEffect } from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import NotificationAvatar from "../elements/NotificationAvatar";
import NotificationContent from "../elements/NotificationContent";
import NotificationActions from "../elements/NotificationActions";
import NotificationTimeStamp from "../elements/NotificationTimeStamp";
import { motion, AnimatePresence } from "framer-motion";
import { type HighlightableItemType } from "@/utils/highlight";
import { getNotificationBorderColor } from "../utils/notificationColorUtils";
import { createLogger } from "@/utils/logger";

// Create logger for this component
const logger = createLogger('NotificationItem');

interface NotificationItemProps {
  notification: BaseNotification;
  onSelect?: () => void;
}

/**
 * An efficient notification item component
 * Renders a notification with minimal space usage
 */
const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onSelect
}) => {
  // State for animation
  const [isSliding, setIsSliding] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Log notification details for debugging
  useEffect(() => {
    logger.debug(`Rendering notification: ${notification.id}`, {
      type: notification.notification_type,
      title: notification.title,
      contentType: notification.content_type,
      metadata: notification.context
    });
  }, [notification]);

  // Animation handler for swipe out
  const handleSwipeOut = () => {
    setIsSliding(true);
    
    // After animation completes, mark as removed so parent can adjust layout
    setTimeout(() => {
      setIsRemoved(true);
    }, 500); // Match this with animation duration
  };

  // Get content type for navigation
  const getContentType = (): HighlightableItemType | undefined => {
    const type = notification.notification_type;
    if (type === "event" || type === "safety" || type === "skills" || type === "goods" || type === "neighbors") {
      return type as HighlightableItemType;
    }
    return undefined;
  };

  // Get content ID
  const getContentId = (): string => {
    // For RSVP notifications, use the event_id from metadata if available
    if (notification.notification_type === 'event' && notification.context?.event_id) {
      return notification.context.event_id;
    }
    return notification.content_id || notification.id;
  };

  // Get the user's name 
  const displayName = notification.profiles?.display_name || notification.context?.neighborName || "A neighbor";

  // Get notification border color based on its type
  const borderColorClass = getNotificationBorderColor(notification.notification_type);
  
  // If removed, don't render anything
  if (isRemoved) {
    return null;
  }
  
  return (
    <AnimatePresence>
      <motion.div 
        ref={notificationRef} 
        initial={{ x: 0, opacity: 1, height: "auto" }}
        animate={isSliding ? 
          { x: "100%", opacity: 0 } : 
          { x: 0, opacity: 1 }
        }
        exit={{ height: 0, opacity: 0, marginBottom: 0 }}
        transition={{
          duration: 0.5,
          ease: "easeInOut"
        }}
        className="mb-2"  // Reduced margin for better space usage
        layout
      >
        {/* Streamlined card with less padding and better space usage */}
        <div className={`rounded-lg overflow-hidden border ${notification.is_read ? 'border-gray-100' : 'border-gray-200'} shadow-sm bg-white border-l-4 ${borderColorClass}`}>
          <div className="relative p-3">  {/* Reduced padding */}
            {/* Timestamp in top right, more compact */}
            <NotificationTimeStamp 
              date={notification.created_at} 
              isUnread={!notification.is_read}
              className="absolute top-2 right-2 text-[10px]"  // Smaller timestamp
            />
            
            <div className="flex gap-2">  {/* Reduced gap */}
              {/* Avatar with space-efficient size */}
              <NotificationAvatar 
                url={notification.profiles?.avatar_url} 
                name={displayName} 
                isUnread={!notification.is_read} 
                notificationType={notification.notification_type} 
                size="sm"  // Smaller avatar
              />
              
              {/* Content with natural sentence format */}
              <div className="flex flex-col flex-1 pr-6">  {/* Added right padding for timestamp */}
                <NotificationContent 
                  title={notification.title} 
                  actorName={displayName} 
                  contentType={notification.notification_type} 
                  isUnread={!notification.is_read}
                >
                  {notification.description}
                </NotificationContent>
              </div>
            </div>
          </div>
          
          {/* Compact action buttons with minimal padding */}
          <NotificationActions 
            id={notification.id} 
            contentType={getContentType()} 
            contentId={getContentId()} 
            isRead={notification.is_read} 
            onDismiss={onSelect} 
            triggerSwipeAnimation={handleSwipeOut} 
            notificationType={notification.notification_type}
            className="px-3 py-1 text-xs"  // Smaller padding, smaller text
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationItem;
