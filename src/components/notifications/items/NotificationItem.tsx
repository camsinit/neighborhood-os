
/**
 * Enhanced NotificationItem component that handles
 * advanced notification display and interactions
 */
import React, { useState, useRef } from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { getNotificationStyle } from "../utils/notificationStyles";
import NotificationAvatar from "../elements/NotificationAvatar";
import NotificationContent from "../elements/NotificationContent";
import NotificationActions from "../elements/NotificationActions";
import { motion } from "framer-motion";
import { type HighlightableItemType } from "@/utils/highlight"; // Updated import

interface NotificationItemProps {
  notification: BaseNotification;
  onSelect?: () => void;
}

/**
 * Main notification item component that handles layout and animations
 */
const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onSelect,
}) => {
  // State to track if this notification is currently being animated (for swipe out)
  const [isSliding, setIsSliding] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Get styling based on notification type
  const style = getNotificationStyle(notification.notification_type || "default");
  
  // Animation handler for swipe out when archiving
  const handleSwipeOut = () => {
    // Set sliding state to true to trigger animation
    setIsSliding(true);
    // Animation will last 500ms, matching our setTimeout in NotificationActions
  };

  // Determine content type and ID for navigation
  // This maps the notification type to a highlightable item type
  const getContentType = (): HighlightableItemType | undefined => {
    // Convert notification_type to a highlightable item type if possible
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

  // Get content ID for highlighting - this is usually the content_id
  const getContentId = (): string => {
    return notification.content_id || notification.id;
  };

  return (
    <motion.div
      ref={notificationRef}
      initial={{ x: 0, opacity: 1 }}
      animate={isSliding ? { x: "-100%", opacity: 0 } : { x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="mb-3"
    >
      <div 
        className={`notification-item rounded-lg overflow-hidden border border-gray-100 shadow-sm 
          ${notification.is_read ? '' : 'bg-blue-50'}`} 
      >
        <div 
          className={`flex flex-col p-3 ${style.backgroundColor}`}
        >
          {/* Avatar and content section */}
          <div className="flex items-start gap-3 mb-2">
            {/* Avatar based on notification type */}
            <NotificationAvatar 
              url={notification.profiles?.avatar_url} 
              name={notification.profiles?.display_name || "Neighbor"} 
              isUnread={!notification.is_read}
            />
            
            {/* Title and description area */}
            <NotificationContent 
              title={notification.title}
              contentType={notification.content_type} // Pass content_type for highlighting
              isUnread={!notification.is_read}
            >
              {/* Add description as children if it exists */}
              {notification.description && (
                <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
              )}
            </NotificationContent>
          </div>
          
          {/* Actions (View and Archive buttons) */}
          <NotificationActions
            id={notification.id}
            contentType={getContentType()} // Pass the content type
            contentId={getContentId()} // Pass the content ID
            isRead={notification.is_read}
            onDismiss={onSelect}
            triggerSwipeAnimation={handleSwipeOut}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationItem;
