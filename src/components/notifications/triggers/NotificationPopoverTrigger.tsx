
/**
 * NotificationPopoverTrigger.tsx
 * 
 * Trigger button for the notifications popover
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import NotificationBadge from "../elements/NotificationBadge";

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
      <NotificationBadge count={unreadCount} />
    </Button>
  );
};

export default NotificationPopoverTrigger;
