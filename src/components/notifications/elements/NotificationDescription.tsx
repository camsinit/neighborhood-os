
/**
 * NotificationDescription.tsx
 * 
 * A reusable component for displaying descriptive text about a notification
 * with appropriate styling and icon
 */
import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import NotificationIcon from "./NotificationIcon";

export interface NotificationDescriptionProps {
  text: string;
  type: string;
  icon?: LucideIcon;
  className?: string;
  iconColor?: string;
}

/**
 * Renders a descriptive text line with optional icon for notifications
 */
export const NotificationDescription: React.FC<NotificationDescriptionProps> = ({
  text,
  type,
  icon,
  className,
  iconColor
}) => {
  return (
    <div className={cn("mt-1 flex items-start gap-1", className)}>
      <NotificationIcon 
        type={type} 
        icon={icon}
        className="mt-0.5"
        color={iconColor}
      />
      <p className="text-xs text-gray-700">
        {text}
      </p>
    </div>
  );
};

export default NotificationDescription;
