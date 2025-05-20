
/**
 * Minimalist NotificationItem component
 * 
 * This component presents notifications with a clean, user-focused design
 * that prioritizes the person, action, and timeframe
 */
import React, { useState, useRef } from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import NotificationAvatar from "../elements/NotificationAvatar";
import NotificationContent from "../elements/NotificationContent";
import NotificationActions from "../elements/NotificationActions";
import NotificationTimeStamp from "../elements/NotificationTimeStamp";
import { motion, AnimatePresence } from "framer-motion";
// Fix import to use the correct path for HighlightableItemType
import { type HighlightableItemType } from '@/utils/highlight/types';
import { getNotificationBorderColor } from "../utils/notificationColorUtils";
import { createLogger } from "@/utils/logger";

// Create logger for this component
const logger = createLogger('NotificationItem');

interface NotificationItemProps {
  notification: BaseNotification;
  onSelect?: () => void;
}

/**
 * A minimalist notification item component
 * Renders a notification with avatar, content, timestamp, and actions
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
  logger.debug(`Rendering notification: ${notification.id}`, {
    type: notification.notification_type,
    title: notification.title,
    contentType: notification.content_type,
    metadata: notification.context
  });

  // Animation handler for swipe out
  const handleSwipeOut = () => {
    setIsSliding(true);
    
    // After animation completes, mark as removed
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
        className="mb-3"
        layout
      >
        <div className={`rounded-lg overflow-hidden border ${notification.is_read ? 'border-gray-100' : 'border-gray-200'} shadow-sm bg-white border-l-4 ${borderColorClass}`}>
          <div className="relative p-4 pb-2">
            {/* Timestamp in top right */}
            <NotificationTimeStamp date={notification.created_at} isUnread={!notification.is_read} />
            
            <div className="flex gap-3">
              {/* Avatar with appropriate size */}
              <NotificationAvatar 
                url={notification.profiles?.avatar_url} 
                name={displayName} 
                isUnread={!notification.is_read} 
                notificationType={notification.notification_type} 
                size="md" 
              />
              
              {/* Content with sentence format */}
              <div className="flex flex-col flex-1">
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
          
          {/* Action buttons */}
          <NotificationActions 
            id={notification.id} 
            contentType={getContentType()} 
            contentId={getContentId()} 
            isRead={notification.is_read} 
            onDismiss={onSelect} 
            triggerSwipeAnimation={handleSwipeOut} 
            notificationType={notification.notification_type}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationItem;
