
/**
 * NotificationContent.tsx
 * 
 * A reusable component for rendering the content of notification items
 * with minimalist design principles
 */
import React from "react";
import { cn } from "@/lib/utils";
import { highlightTitleContent } from "@/utils/highlight/titleHighlighting";

interface NotificationContentProps {
  title: string;
  actorName?: string;  // Added actor name for better human-readable format
  contentType?: string;  
  isUnread?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Component for rendering the main content of a notification with plain English formatting
 */
const NotificationContent: React.FC<NotificationContentProps> = ({
  title,
  actorName,
  contentType,
  isUnread = false,
  className,
  children
}) => {
  // Format the title to be more human-readable if we have an actor name
  const formattedTitle = actorName 
    ? `${actorName} ${title.toLowerCase()}` 
    : title;
  
  // Use our title highlighting utility to highlight content parts
  const highlightedTitle = highlightTitleContent(formattedTitle, contentType);

  return (
    <div className={cn("flex flex-col flex-1 min-w-0", className)}>
      {/* Main notification text */}
      <p 
        className={cn(
          "text-sm leading-tight", 
          isUnread ? "font-medium text-gray-900" : "font-normal text-gray-800"
        )}
      >
        {highlightedTitle}
      </p>
      
      {/* Optional description or other content */}
      {children && (
        <div className="mt-1">
          {children}
        </div>
      )}
    </div>
  );
};

export default NotificationContent;
