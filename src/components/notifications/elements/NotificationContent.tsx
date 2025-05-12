
/**
 * NotificationContent.tsx
 * 
 * A reusable component for rendering the content of notification items
 * including title and optional children like description
 */
import React from "react";
import { cn } from "@/lib/utils";
import { highlightTitleContent } from "@/utils/highlight/titleHighlighting";

interface NotificationContentProps {
  title: string;
  contentType?: string;  // Added content type for highlighting
  isUnread?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Component for rendering the main content (title & description) of a notification
 */
const NotificationContent: React.FC<NotificationContentProps> = ({
  title,
  contentType, // Used for title highlighting
  isUnread = false,
  className,
  children
}) => {
  // Use our title highlighting utility to highlight content parts
  const highlightedTitle = highlightTitleContent(title, contentType);

  return (
    <div className={cn("flex flex-col flex-1 min-w-0", className)}>
      <h4 
        className={cn(
          "text-sm font-medium leading-tight", 
          isUnread ? "font-semibold" : ""
        )}
      >
        {/* Use our highlighted title */}
        {highlightedTitle}
      </h4>
      
      {/* Optional description or other content */}
      {children && (
        <div className="mt-0.5">
          {children}
        </div>
      )}
    </div>
  );
};

export default NotificationContent;
