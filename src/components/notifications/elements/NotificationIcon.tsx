
/**
 * NotificationIcon.tsx
 * 
 * A reusable component for displaying notification icons with appropriate styling
 */
import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { getNotificationStyle } from "../utils/notificationStyles";

export interface NotificationIconProps {
  type: string;
  icon?: LucideIcon;
  className?: string;
  size?: "xs" | "sm" | "md";
  color?: string;
}

/**
 * Renders an appropriate icon for a notification with type-based styling
 */
export const NotificationIcon: React.FC<NotificationIconProps> = ({
  type,
  icon: CustomIcon,
  className,
  size = "sm",
  color
}) => {
  // Get the style based on notification type
  const style = getNotificationStyle(type);
  
  // Use the provided icon or fall back to the default for this type
  const Icon = CustomIcon || style.icon;
  
  // Determine size class based on size prop
  const sizeClass = {
    xs: "h-3 w-3",
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4"
  }[size];
  
  // Determine text color class based on notification type or custom color
  const colorClass = color ? `text-${color}` : style.textColor;
  
  return (
    <Icon 
      className={cn(
        sizeClass,
        colorClass,
        "flex-shrink-0",
        className
      )} 
    />
  );
};

export default NotificationIcon;
