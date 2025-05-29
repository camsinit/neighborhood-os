
/**
 * NotificationContent.tsx
 * 
 * A reusable component for rendering the content of notification items
 * with natural language formatting and proper module color highlighting
 */
import React from "react";
import { cn } from "@/lib/utils";

interface NotificationContentProps {
  title: string;
  actorName?: string;
  contentType?: string;
  isUnread?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Get the appropriate highlight color for different content types
 * Using module theme colors for consistency
 */
const getHighlightColor = (contentType?: string): string => {
  switch (contentType) {
    case 'events':
    case 'event':
      return 'text-blue-600'; // Calendar blue
    case 'skills':
      return 'text-green-600'; // Skills green
    case 'goods':
      return 'text-orange-600'; // Goods orange
    case 'safety':
      return 'text-red-600'; // Safety red
    case 'neighbors':
    case 'neighbor_welcome':
      return 'text-purple-600'; // Neighbors purple
    default:
      return 'text-indigo-600'; // Default
  }
};

/**
 * Component for rendering the main content of a notification with natural language formatting
 * Now with simplified highlighting that only colors the main subject
 */
const NotificationContent: React.FC<NotificationContentProps> = ({
  title,
  actorName,
  contentType,
  isUnread = false,
  className,
  children
}) => {
  // Get highlight color for the content type
  const highlightColor = getHighlightColor(contentType);

  // Create the full title with actor name if not already included
  const titleAlreadyHasActor = actorName && title.toLowerCase().includes(actorName.toLowerCase());
  const fullTitle = !titleAlreadyHasActor && actorName ? `${actorName} ${title}` : title;

  // Parse and highlight the main subject (event name, skill name, item name, etc.)
  const renderHighlightedTitle = () => {
    // For RSVP notifications: "Cam RSVP'd to Event Name"
    if (title.includes("RSVP'd to")) {
      const parts = fullTitle.split("RSVP'd to");
      if (parts.length === 2) {
        return (
          <>
            {parts[0]}RSVP'd to{' '}
            <span className={cn("font-semibold", highlightColor)}>
              {parts[1].trim()}
            </span>
          </>
        );
      }
    }

    // For "is hosting" events: "Sarah is hosting Community BBQ"
    if (title.includes("is hosting")) {
      const parts = fullTitle.split("is hosting");
      if (parts.length === 2) {
        return (
          <>
            {parts[0]}is hosting{' '}
            <span className={cn("font-semibold", highlightColor)}>
              {parts[1].trim()}
            </span>
          </>
        );
      }
    }

    // For "shared" skills: "Mike shared Guitar lessons"
    if (title.includes("shared")) {
      const parts = fullTitle.split("shared");
      if (parts.length === 2) {
        return (
          <>
            {parts[0]}shared{' '}
            <span className={cn("font-semibold", highlightColor)}>
              {parts[1].trim()}
            </span>
          </>
        );
      }
    }

    // For "is offering" goods: "Lisa is offering Desk chair"
    if (title.includes("is offering")) {
      const parts = fullTitle.split("is offering");
      if (parts.length === 2) {
        return (
          <>
            {parts[0]}is offering{' '}
            <span className={cn("font-semibold", highlightColor)}>
              {parts[1].trim()}
            </span>
          </>
        );
      }
    }

    // For "reported" safety: "Tom reported Suspicious activity"
    if (title.includes("reported")) {
      const parts = fullTitle.split("reported");
      if (parts.length === 2) {
        return (
          <>
            {parts[0]}reported{' '}
            <span className={cn("font-semibold", highlightColor)}>
              {parts[1].trim()}
            </span>
          </>
        );
      }
    }

    // For "joined" neighbors: "Alex joined your neighborhood"
    if (title.includes("joined your neighborhood")) {
      const parts = fullTitle.split(" joined your neighborhood");
      if (parts.length === 2) {
        return (
          <>
            <span className={cn("font-semibold", highlightColor)}>
              {parts[0]}
            </span>
            {' '}joined your neighborhood{parts[1]}
          </>
        );
      }
    }

    // Default: return the title as-is
    return fullTitle;
  };
  
  return (
    <div className={cn("flex items-center gap-2 min-w-0", className)}>
      {/* Main notification text with highlighting */}
      <p className={cn(
        "text-sm leading-tight", 
        isUnread ? "font-medium text-gray-900" : "text-gray-800"
      )}>
        {renderHighlightedTitle()}
      </p>
      
      {/* Optional content like description, comment preview, etc. */}
      {children}
    </div>
  );
};

export default NotificationContent;
