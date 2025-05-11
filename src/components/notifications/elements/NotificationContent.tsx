
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
  children?: React.ReactNode; // Children to render additional content like description
  className?: string;
  formattedTitle?: React.ReactNode; // Added this to support formatted titles
}

/**
 * Renders the main content area for notification items
 * 
 * @param title - The title of the notification
 * @param isUnread - Whether the notification is unread (affects styling)
 * @param children - Additional content like description or actions
 * @param className - Additional CSS classes to apply
 * @param formattedTitle - Optional pre-formatted title with highlights
 */
export const NotificationContent: React.FC<NotificationContentProps> = ({
  title,
  isUnread = false,
  children,
  className,
  formattedTitle // New prop for formatted title with highlights
}) => {
  return (
    <div className={cn("flex-1 min-w-0 overflow-hidden", className)}>
      <h4 
        className={cn(
          "text-base leading-tight mb-1 break-words", // Added break-words to prevent overflow
          isUnread ? "font-medium text-gray-900" : "font-normal text-gray-700"
        )}
      >
        {/* Use the formatted title if provided, otherwise use the plain title */}
        {formattedTitle || title}
      </h4>
      
      {/* Render children (description or other content) */}
      {children}
    </div>
  );
};

export default NotificationContent;
