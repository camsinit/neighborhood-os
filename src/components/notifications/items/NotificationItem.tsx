
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
import { motion } from "framer-motion";
import { type HighlightableItemType } from "@/utils/highlight";
import { getNotificationBorderColor } from "../utils/notificationColorUtils";

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
  onSelect,
}) => {
  // State for animation
  const [isSliding, setIsSliding] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Animation handler for swipe out
  const handleSwipeOut = () => {
    setIsSliding(true);
  };

  // Get content type for navigation
  const getContentType = (): HighlightableItemType | undefined => {
    const type = notification.notification_type;
    if (
      type === "event" || 
      type === "safety" || 
      type === "skills" || 
      type === "goods" ||
      type === "neighbors"
    ) {
      return type as HighlightableItemType;
    }
    return undefined;
  };

  // Get content ID
  const getContentId = (): string => {
    return notification.content_id || notification.id;
  };

  // Get the user's name 
  const displayName = notification.profiles?.display_name || "A neighbor";
  
  // Get notification border color based on its type
  const borderColorClass = getNotificationBorderColor(notification.notification_type);

  return (
    <motion.div
      ref={notificationRef}
      initial={{ x: 0, opacity: 1 }}
      animate={isSliding ? { x: "-100%", opacity: 0 } : { x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="mb-3"
    >
      <div 
        className={`rounded-lg overflow-hidden border ${notification.is_read ? 'border-gray-100' : 'border-gray-200'} shadow-sm bg-white border-l-4 ${borderColorClass}`} 
      >
        <div className="relative p-4">
          {/* Timestamp in top right */}
          <NotificationTimeStamp 
            date={notification.created_at} 
            isUnread={!notification.is_read}
          />
          
          <div className="flex gap-3">
            {/* Avatar with appropriate size */}
            <NotificationAvatar 
              url={notification.profiles?.avatar_url} 
              name={displayName}
              isUnread={!notification.is_read}
              notificationType={notification.notification_type}
              size="md"
            />
            
            {/* Content with plain-English format and direct highlighting */}
            <div className="flex flex-col flex-1">
              <NotificationContent 
                title={notification.title}
                actorName={displayName}
                contentType={notification.notification_type}
                isUnread={!notification.is_read}
              >
                {notification.description && (
                  <p className="text-xs text-gray-600">{notification.description}</p>
                )}
              </NotificationContent>
              
              {/* Minimal action buttons */}
              <NotificationActions
                id={notification.id}
                contentType={getContentType()}
                contentId={getContentId()}
                isRead={notification.is_read}
                onDismiss={onSelect}
                triggerSwipeAnimation={handleSwipeOut}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationItem;
