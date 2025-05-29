
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
 * Enhanced to handle more notification patterns and ensure highlighting works
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

  // Parse and highlight the main subject with improved pattern matching
  const renderHighlightedTitle = () => {
    console.log('Rendering title:', fullTitle, 'Content type:', contentType); // Debug log

    // For RSVP notifications: "Cam RSVP'd to Event Name" or "RSVP'd to Event Name"
    if (fullTitle.includes("RSVP'd to") || fullTitle.includes("RSVP'd for")) {
      const rsvpMatch = fullTitle.match(/(.*?)(RSVP'd (?:to|for))\s+(.+)/);
      if (rsvpMatch) {
        return (
          <>
            {rsvpMatch[1]}{rsvpMatch[2]}{' '}
            <span className={cn("font-semibold", highlightColor)}>
              {rsvpMatch[3]}
            </span>
          </>
        );
      }
    }

    // For "New RSVP for" format: "New RSVP for Event Name"
    if (fullTitle.includes("New RSVP for")) {
      const newRsvpMatch = fullTitle.match(/(New RSVP for)\s+(.+)/);
      if (newRsvpMatch) {
        return (
          <>
            {newRsvpMatch[1]}{' '}
            <span className={cn("font-semibold", highlightColor)}>
              {newRsvpMatch[2]}
            </span>
          </>
        );
      }
    }

    // For "is hosting" events: "Sarah is hosting Community BBQ"
    if (fullTitle.includes("is hosting")) {
      const hostingMatch = fullTitle.match(/(.*?is hosting)\s+(.+)/);
      if (hostingMatch) {
        return (
          <>
            {hostingMatch[1]}{' '}
            <span className={cn("font-semibold", highlightColor)}>
              {hostingMatch[2]}
            </span>
          </>
        );
      }
    }

    // For "shared" skills: "Mike shared Guitar lessons"
    if (fullTitle.includes("shared")) {
      const sharedMatch = fullTitle.match(/(.*?shared)\s+(.+)/);
      if (sharedMatch) {
        return (
          <>
            {sharedMatch[1]}{' '}
            <span className={cn("font-semibold", highlightColor)}>
              {sharedMatch[2]}
            </span>
          </>
        );
      }
    }

    // For "is offering" goods: "Lisa is offering Desk chair"
    if (fullTitle.includes("is offering")) {
      const offeringMatch = fullTitle.match(/(.*?is offering)\s+(.+)/);
      if (offeringMatch) {
        return (
          <>
            {offeringMatch[1]}{' '}
            <span className={cn("font-semibold", highlightColor)}>
              {offeringMatch[2]}
            </span>
          </>
        );
      }
    }

    // For "reported" safety: "Tom reported Suspicious activity"
    if (fullTitle.includes("reported")) {
      const reportedMatch = fullTitle.match(/(.*?reported)\s+(.+)/);
      if (reportedMatch) {
        return (
          <>
            {reportedMatch[1]}{' '}
            <span className={cn("font-semibold", highlightColor)}>
              {reportedMatch[2]}
            </span>
          </>
        );
      }
    }

    // For "joined your neighborhood": "Alex joined your neighborhood"
    if (fullTitle.includes("joined your neighborhood")) {
      const joinedMatch = fullTitle.match(/^(.+?)\s+(joined your neighborhood.*)$/);
      if (joinedMatch) {
        return (
          <>
            <span className={cn("font-semibold", highlightColor)}>
              {joinedMatch[1]}
            </span>
            {' '}{joinedMatch[2]}
          </>
        );
      }
    }

    // For any other pattern with a colon: "Something: Content"
    if (fullTitle.includes(":")) {
      const colonMatch = fullTitle.match(/^(.*?):\s*(.+)$/);
      if (colonMatch) {
        return (
          <>
            {colonMatch[1]}:{' '}
            <span className={cn("font-semibold", highlightColor)}>
              {colonMatch[2]}
            </span>
          </>
        );
      }
    }

    // Fallback: try to highlight the last part after common action words
    const actionWords = ['created', 'added', 'updated', 'posted', 'submitted'];
    for (const action of actionWords) {
      if (fullTitle.includes(action)) {
        const actionMatch = fullTitle.match(new RegExp(`(.*?${action})\\s+(.+)`));
        if (actionMatch) {
          return (
            <>
              {actionMatch[1]}{' '}
              <span className={cn("font-semibold", highlightColor)}>
                {actionMatch[2]}
              </span>
            </>
          );
        }
      }
    }

    // Default: return the title as-is
    console.log('No pattern matched for title:', fullTitle); // Debug log
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
