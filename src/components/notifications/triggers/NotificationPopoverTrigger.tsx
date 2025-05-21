
/**
 * NotificationPopoverTrigger.tsx
 * 
 * Trigger button for the notifications popover
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { NotificationBadge } from "../elements"; // Updated import

interface NotificationPopoverTriggerProps {
  unreadCount: number;
}

/**
 * Default trigger button for the notifications popover
 */
const NotificationPopoverTrigger: React.FC<NotificationPopoverTriggerProps> = ({ 
  unreadCount 
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative hover:bg-gray-100"
    >
      <Bell className="h-5 w-5" />
      {/* Now using count prop instead of label */}
      {unreadCount > 0 && (
        <NotificationBadge 
          count={unreadCount} 
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
        />
      )}
    </Button>
  );
};

export default NotificationPopoverTrigger;
