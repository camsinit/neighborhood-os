
/**
 * NotificationGroup.tsx
 * 
 * Component for rendering a group of notifications with a title
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import NotificationCardFactory from "../cards/NotificationCardFactory";

// Props for NotificationGroup component
interface NotificationGroupProps {
  title: string;
  notifications: BaseNotification[];
  onClose?: () => void;
}

/**
 * Renders a group of notifications with a common title (Today, Yesterday, etc.)
 * 
 * @param title - The group title (e.g., "Today", "Yesterday")
 * @param notifications - Array of notifications to display in this group
 * @param onClose - Optional callback for when notifications are dismissed
 */
const NotificationGroup: React.FC<NotificationGroupProps> = ({
  title,
  notifications,
  onClose
}) => {
  return (
    <div className="space-y-2">
      {/* Group title */}
      <h4 className="text-sm font-medium text-gray-500 px-4">{title}</h4>
      
      {/* Notifications list */}
      <div className="space-y-3 px-4">
        {notifications.map(notification => (
          <NotificationCardFactory 
            key={notification.id} 
            notification={notification} 
            onDismiss={onClose} 
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationGroup;
