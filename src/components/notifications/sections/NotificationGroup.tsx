/**
 * NotificationGroup.tsx
 * 
 * Component for rendering a group of notifications with a title
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { NotificationCardFactory } from "../cards/NotificationCardFactory"; // Changed from default to named import
import { motion } from "framer-motion"; // Import for animation support

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
    <motion.div 
      className="space-y-2"
      layout // This enables automatic layout adjustment
      transition={{ type: "spring", damping: 30, stiffness: 200 }} // Add spring physics for smoother motion
    >
      {/* Group title */}
      <h4 className="text-sm font-medium text-gray-500 px-4">{title}</h4>
      
      {/* Notifications list */}
      <motion.div 
        className="space-y-3 px-4"
        layout
      >
        {notifications.map(notification => (
          <NotificationCardFactory 
            key={notification.id} 
            notification={notification} 
            onDismiss={onClose} 
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default NotificationGroup;
