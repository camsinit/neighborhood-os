
/**
 * NotificationDescription.tsx
 * 
 * A description component for notifications that provides secondary information
 * and supports icon display
 */
import React from "react";
import { cn } from "@/lib/utils";
import { getNotificationTextColor } from "../utils/notificationColorUtils";
import { LucideIcon } from "lucide-react";

interface NotificationDescriptionProps {
  text: string;
  type?: string;
  icon?: LucideIcon;
  iconColor?: string;
  className?: string;
}

/**
 * Displays secondary notification information with optional icon
 */
const NotificationDescription: React.FC<NotificationDescriptionProps> = ({
  text,
  type,
  icon: Icon,
  iconColor,
  className
}) => {
  // Get color based on notification type
  const textColorClass = getNotificationTextColor(type);
  
  return (
    <div className={cn(
      "flex items-center gap-1.5 text-xs text-gray-600 mt-1", 
      className
    )}>
      {/* Optional icon */}
      {Icon && (
        <Icon className={cn("h-3.5 w-3.5", iconColor || textColorClass)} />
      )}
      
      {/* Description text */}
      <span>{text}</span>
    </div>
  );
};

export default NotificationDescription;
