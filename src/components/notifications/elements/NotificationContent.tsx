
/**
 * NotificationContent.tsx
 * 
 * A reusable component for displaying the main content of a notification
 * including title, description, and optional metadata
 */
import React from "react";
import { cn } from "@/lib/utils";

export interface NotificationContentProps {
  title: string;
  isUnread?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Renders the main content area for notification items
 */
export const NotificationContent: React.FC<NotificationContentProps> = ({
  title,
  isUnread = false,
  children,
  className
}) => {
  return (
    <div className={cn("flex-1 min-w-0", className)}>
      <h4 
        className={cn(
          "text-sm leading-tight mb-1",
          isUnread ? "font-medium text-gray-900" : "font-normal text-gray-700"
        )}
      >
        {title}
      </h4>
      
      {children}
    </div>
  );
};

export default NotificationContent;
