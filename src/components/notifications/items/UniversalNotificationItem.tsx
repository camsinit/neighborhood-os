
/**
 * UniversalNotificationItem.tsx
 * 
 * The single, universal component for rendering ALL notification types.
 * This replaces all specialized notification cards and provides consistent
 * formatting with proper subject highlighting and clean design.
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
const logger = createLogger('UniversalNotificationItem');

interface UniversalNotificationItemProps {
  notification: BaseNotification;
  onSelect?: () => void;
}

/**
 * The single universal notification component that handles ALL notification types
 * with consistent formatting, highlighting, and interactions
 */
const UniversalNotificationItem: React.FC<UniversalNotificationItemProps> = ({
  notification,
  onSelect
}) => {
  // State for animation
  const [isSliding, setIsSliding] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Log notification details for debugging
  useEffect(() => {
    logger.debug(`Rendering universal notification: ${notification.id}`, {
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

  // Get content type for navigation - handles all notification types
  const getContentType = (): HighlightableItemType | undefined => {
    const type = notification.notification_type;
    if (type === "event" || type === "safety" || type === "skills" || type === "goods" || type === "neighbors") {
      return type as HighlightableItemType;
    }
    return undefined;
  };

  // Get content ID - handles different ID patterns across notification types
  const getContentId = (): string => {
    // For RSVP notifications, use the event_id from metadata if available
    if (notification.notification_type === 'event' && notification.context?.event_id) {
      return notification.context.event_id;
    }
    
    // For skill session notifications, prefer event_id if available
    if (notification.context?.metadata?.event_id) {
      return notification.context.metadata.event_id;
    }
    
    // Default to content_id or notification id
    return notification.content_id || notification.id;
  };

  // Get the user's name with fallbacks for all notification types
  const displayName = notification.profiles?.display_name || 
                     notification.context?.neighborName || 
                     notification.context?.actorName || 
                     "A neighbor";

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
        className="mb-2"
        layout
      >
        {/* Universal card design with consistent styling */}
        <div className={`rounded-lg overflow-hidden border ${notification.is_read ? 'border-gray-100' : 'border-gray-200'} shadow-sm bg-white border-l-4 ${borderColorClass}`}>
          <div className="relative p-3">
            {/* Timestamp in top right - consistent across all types */}
            <NotificationTimeStamp 
              date={notification.created_at} 
              isUnread={!notification.is_read}
              className="absolute top-2 right-2 text-[10px]"
            />
            
            <div className="flex gap-2">
              {/* Avatar - consistent sizing and fallbacks */}
              <NotificationAvatar 
                url={notification.profiles?.avatar_url} 
                name={displayName} 
                isUnread={!notification.is_read} 
                notificationType={notification.notification_type} 
                size="sm"
              />
              
              {/* Content with universal highlighting system */}
              <div className="flex flex-col flex-1 pr-6">
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
          
          {/* Universal action buttons - same for all notification types */}
          <NotificationActions 
            id={notification.id} 
            contentType={getContentType()} 
            contentId={getContentId()} 
            isRead={notification.is_read} 
            onDismiss={onSelect} 
            triggerSwipeAnimation={handleSwipeOut} 
            notificationType={notification.notification_type}
            className="px-3 py-1 text-xs"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UniversalNotificationItem;
