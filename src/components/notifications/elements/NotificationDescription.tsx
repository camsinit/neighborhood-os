
/**
 * NotificationDescription.tsx
 * 
 * A reusable component for rendering descriptive text in notifications
 */
import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NotificationDescriptionProps {
  text: string;
  icon?: LucideIcon;
  iconColor?: string;
  type?: string;
  className?: string;
}

/**
 * Component for rendering notification descriptions with optional icon
 */
const NotificationDescription: React.FC<NotificationDescriptionProps> = ({
  text,
  icon: Icon,
  iconColor = "blue-500",
  type,
  className
}) => {
  return (
    <div className={cn("text-xs text-gray-600 flex items-center gap-1 mt-1", className)}>
      {Icon && <Icon className={`h-3 w-3 text-${iconColor}`} />}
      <span>{text}</span>
    </div>
  );
};

export default NotificationDescription;
