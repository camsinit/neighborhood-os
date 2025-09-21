
/**
 * Universal Notification Item Component
 * 
 * Handles all notification types with smart navigation integration
 * Now uses the unified ItemNavigationService for consistent navigation
 * Features slide-out animation when archiving notifications
 */
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Archive, User } from 'lucide-react';
import { differenceInHours, differenceInDays, differenceInWeeks, differenceInMonths } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { NotificationWithProfile } from './types';
import { useNotificationActions } from './useNotifications';
import { createItemNavigationService } from '@/services/navigation/ItemNavigationService';
import { HighlightableItemType } from '@/utils/highlight/types';
import { highlightTitleContent } from '@/utils/highlight/titleHighlighting';
import { getModuleThemeColor } from '@/theme/moduleTheme';

interface NotificationItemProps {
  notification: NotificationWithProfile;
  variant?: 'popover' | 'drawer';
}

/**
 * Helper function to format time since notification in a compact way
 * Same format as used in ActivityItem for consistency
 */
const getCompactTimeAgo = (date: Date): string => {
  // This function formats the timestamp into a human-readable format
  const now = new Date();
  const hours = differenceInHours(now, date);
  const days = differenceInDays(now, date);
  const weeks = differenceInWeeks(now, date);
  const months = differenceInMonths(now, date);

  if (hours < 24) {
    return `${hours}hr`;
  } else if (days < 7) {
    return `${days}d`;
  } else if (weeks < 4) {
    return `${weeks}w`;
  } else {
    return `${months}mo`;
  }
};

// Simplified color mapping - direct lookup table for better performance
const CONTENT_TYPE_COLORS: Record<string, string> = {
  // Events/Calendar
  'events': '#3B82F6',
  'event': '#3B82F6',
  
  // Skills (skill_sessions deprecated)
  'skills': '#22C55E',
  'skill': '#22C55E',
  
  // Goods/Freebies
  'goods': '#F97316',
  'good': '#F97316',
  
  // Safety/Updates
  'safety': '#EA384C',
  'safety_updates': '#EA384C',
  
  // Neighbors
  'neighbors': '#8B5FFF',
  'neighbor': '#8B5FFF',
  
  // Groups
  'groups': '#8B5FFF',
  'group': '#8B5FFF'
};

const getThemeColor = (contentType: string): string => {
  const type = contentType?.toLowerCase() || '';
  
  // Direct lookup first
  if (CONTENT_TYPE_COLORS[type]) {
    return CONTENT_TYPE_COLORS[type];
  }
  
  // Fallback pattern matching for compound types
  for (const [key, color] of Object.entries(CONTENT_TYPE_COLORS)) {
    if (type.includes(key)) {
      return color;
    }
  }
  
  // Default purple
  return '#8B5FFF';
};

// Map content types to highlight types for smart navigation
const getHighlightType = (contentType: string): HighlightableItemType | null => {
  switch (contentType) {
    case 'events':
      return 'event';
    case 'safety':
      return 'safety';
    case 'skills':
      return 'skills';
    case 'goods':
      return 'goods';
    case 'neighbors':
      return 'neighbors';
    case 'groups':
      return 'group';
    default:
      return null;
  }
};

/**
 * Helper function to render notification title with comprehensive highlighting
 * Ensures both actor name and subject content are ALWAYS highlighted in theme color
 * Handles all notification patterns to guarantee at least 2 highlighted elements
 */
const renderHighlightedNotificationTitle = (title: string, actorName: string, themeColor: string): React.ReactNode => {
  // Find the actor name in the title and highlight it
  const actorIndex = title.indexOf(actorName);
  
  if (actorIndex === -1) {
    // Actor name not found in title, just return the title as-is
    return title;
  }
  
  // Split the title into parts: before name, name, after name
  const beforeName = title.substring(0, actorIndex);
  const afterNameStart = actorIndex + actorName.length;
  const afterName = title.substring(afterNameStart);
  
  // Comprehensive pattern matching for all notification types
  
  // Pattern 1: "is hosting [Event Title] with [Group Name]" - group events
  const groupEventPattern = /\s+is hosting\s+(.+?)\s+with\s+(.+)$/i;
  const groupEventMatch = afterName.match(groupEventPattern);
  if (groupEventMatch) {
    const eventTitle = groupEventMatch[1];
    const groupName = groupEventMatch[2];
    return React.createElement(
      React.Fragment,
      null,
      beforeName,
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, actorName),
      " is hosting ",
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, eventTitle),
      " with ",
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, groupName)
    );
  }
  
  // Pattern 2: "created an event for [Group Name]: [Event Title]" - group events
  const createdGroupEventPattern = /\s+created an event for\s+(.+?):\s*(.+)$/i;
  const createdGroupEventMatch = afterName.match(createdGroupEventPattern);
  if (createdGroupEventMatch) {
    const groupName = createdGroupEventMatch[1];
    const eventTitle = createdGroupEventMatch[2];
    return React.createElement(
      React.Fragment,
      null,
      beforeName,
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, actorName),
      " created an event for ",
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, groupName),
      ": ",
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, eventTitle)
    );
  }
  
  // Pattern 3: "joined [Group Name]" - group membership
  const joinedGroupPattern = /\s+joined\s+(.+)$/i;
  const joinedGroupMatch = afterName.match(joinedGroupPattern);
  if (joinedGroupMatch) {
    const groupName = joinedGroupMatch[1];
    return React.createElement(
      React.Fragment,
      null,
      beforeName,
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, actorName),
      " joined ",
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, groupName)
    );
  }
  
  // Pattern 4: "RSVP'd to [Event Title]" - event RSVPs
  const rsvpPattern = /\s+RSVP'd to\s+(.+)$/i;
  const rsvpMatch = afterName.match(rsvpPattern);
  if (rsvpMatch) {
    const eventTitle = rsvpMatch[1];
    return React.createElement(
      React.Fragment,
      null,
      beforeName,
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, actorName),
      " RSVP'd to ",
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, eventTitle)
    );
  }
  
  // Pattern 5: "needs your help with [Skill Title]" - skill session requests
  const skillHelpPattern = /\s+needs your help with\s+(.+)$/i;
  const skillHelpMatch = afterName.match(skillHelpPattern);
  if (skillHelpMatch) {
    const skillTitle = skillHelpMatch[1];
    return React.createElement(
      React.Fragment,
      null,
      beforeName,
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, actorName),
      " needs your help with ",
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, skillTitle)
    );
  }
  
  // Pattern 6: "posted an update in [Group Name]" - group updates
  const groupUpdatePattern = /\s+posted an update in\s+(.+)$/i;
  const groupUpdateMatch = afterName.match(groupUpdatePattern);
  if (groupUpdateMatch) {
    const groupName = groupUpdateMatch[1];
    return React.createElement(
      React.Fragment,
      null,
      beforeName,
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, actorName),
      " posted an update in ",
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, groupName)
    );
  }
  
  // Pattern 7: "commented on your update in [Group Name]" - group comments
  const groupCommentPattern = /\s+commented on your update in\s+(.+)$/i;
  const groupCommentMatch = afterName.match(groupCommentPattern);
  if (groupCommentMatch) {
    const groupName = groupCommentMatch[1];
    return React.createElement(
      React.Fragment,
      null,
      beforeName,
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, actorName),
      " commented on your update in ",
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, groupName)
    );
  }
  
  // Pattern 8: "invited you to join [Group Name]" - group invitations
  const groupInvitePattern = /\s+invited you to join\s+(.+)$/i;
  const groupInviteMatch = afterName.match(groupInvitePattern);
  if (groupInviteMatch) {
    const groupName = groupInviteMatch[1];
    return React.createElement(
      React.Fragment,
      null,
      beforeName,
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, actorName),
      " invited you to join ",
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, groupName)
    );
  }
  
  // Pattern 9: Generic content after colon - "[Actor] [action]: [Content]"
  const colonPattern = /\s*:\s*(.+)$/;
  const colonMatch = afterName.match(colonPattern);
  if (colonMatch) {
    const content = colonMatch[1];
    const beforeColon = afterName.substring(0, afterName.indexOf(':'));
    return React.createElement(
      React.Fragment,
      null,
      beforeName,
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, actorName),
      beforeColon,
      ": ",
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, content)
    );
  }
  
  // Pattern 10: Text in quotes - highlight quoted content
  const quotePattern = /"([^"]+)"/;
  const quoteMatch = afterName.match(quotePattern);
  if (quoteMatch) {
    const quotedContent = quoteMatch[1];
    const beforeQuote = afterName.substring(0, afterName.indexOf('"'));
    const afterQuote = afterName.substring(afterName.indexOf('"') + quotedContent.length + 2);
    return React.createElement(
      React.Fragment,
      null,
      beforeName,
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, actorName),
      beforeQuote,
      '"',
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, quotedContent),
      '"',
      afterQuote
    );
  }
  
  // Pattern 11: Content after common prepositions "to", "with", "for", "from"
  const prepositionPattern = /\s+(to|with|for|from)\s+(.+?)(?:\s+(?:event|skill|session|item|group))?$/i;
  const prepositionMatch = afterName.match(prepositionPattern);
  if (prepositionMatch) {
    const preposition = prepositionMatch[1];
    const content = prepositionMatch[2];
    const beforePreposition = afterName.substring(0, afterName.indexOf(preposition));
    const afterContent = afterName.substring(afterName.indexOf(content) + content.length);
    return React.createElement(
      React.Fragment,
      null,
      beforeName,
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, actorName),
      beforePreposition,
      preposition,
      " ",
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, content),
      afterContent
    );
  }
  
  // Fallback: Try to find any capitalized content that looks like a title/name
  // This catches cases we might have missed
  const titlePattern = /\s+([A-Z][^,.!?]*[a-z][^,.!?]*)/;
  const titleMatch = afterName.match(titlePattern);
  if (titleMatch) {
    const possibleTitle = titleMatch[1];
    const titleIndex = afterName.indexOf(possibleTitle);
    const beforeTitle = afterName.substring(0, titleIndex);
    const afterTitle = afterName.substring(titleIndex + possibleTitle.length);
    return React.createElement(
      React.Fragment,
      null,
      beforeName,
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, actorName),
      beforeTitle,
      React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, possibleTitle),
      afterTitle
    );
  }
  
  // Final fallback: just highlight the actor name (but this should rarely happen)
  return React.createElement(
    React.Fragment,
    null,
    beforeName,
    React.createElement("span", { style: { color: themeColor, fontWeight: '600' } }, actorName),
    afterName
  );
}

export function NotificationItem({ notification, variant = 'drawer' }: NotificationItemProps) {
  const navigate = useNavigate();
  const { markAsRead, archive } = useNotificationActions();

  // Create navigation service instance
  const navigationService = createItemNavigationService(navigate);

  // Get actor info with fallback
  const actorName = notification.profiles?.display_name || 'A neighbor';
  const avatarUrl = notification.profiles?.avatar_url;

  // Format time ago using compact format like in activity feed
  const timeAgo = getCompactTimeAgo(new Date(notification.created_at));

  // Get theme color for this notification's content type
  const themeColor = getThemeColor(notification.content_type);

  // Handle click on notification card - navigate to content like Activity cards
  const handleCardClick = async () => {
    try {
      // Mark as read first
      if (!notification.is_read) {
        await markAsRead(notification.id);
      }

      // Use unified navigation service (same logic as ActivityItem)
      const highlightType = getHighlightType(notification.content_type);
      if (highlightType && notification.content_id) {
        const result = await navigationService.navigateToItem(
          highlightType, 
          notification.content_id, 
          { showToast: true }
        );
        
        if (!result.success) {
          toast.error(result.error || 'Failed to navigate to content');
        }
      } else {
        // Fallback for unsupported content types
        toast.error('Unable to navigate to this content type');
      }

    } catch (error) {
      console.error('Error navigating from notification:', error);
      toast.error('Failed to navigate');
    }
  };

  // Simplified archive handler with optimistic updates
  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await archive(notification.id);
      toast.success('Notification archived');
    } catch (error) {
      console.error('Error archiving notification:', error);
      toast.error('Failed to archive');
    }
  };

  return (
    <Card 
      className={`
        relative p-3 transition-all duration-200 hover:shadow-md cursor-pointer border-l-4 group
        ${!notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white'}
        ${variant === 'popover' ? 'mb-2' : 'mb-3'}
      `}
      style={{
        borderLeftColor: themeColor
      }}
      onClick={handleCardClick}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={avatarUrl || ''} alt={actorName} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Time/Archive */}
          <div className="flex justify-between items-start gap-2">
            <div className={`text-sm leading-tight flex-1 ${!notification.is_read ? 'font-semibold' : 'font-medium'}`}>
              {/* Parse and highlight the notification title similar to how ActivityItem works */}
              {renderHighlightedNotificationTitle(notification.title, actorName, themeColor)}
            </div>
            
            {/* Date/Archive toggle on hover */}
            <div className="flex-shrink-0 relative">
              {/* Date - visible by default, hidden on hover */}
              <span className="text-xs text-gray-500 font-medium group-hover:opacity-0 transition-opacity duration-200">
                {timeAgo}
              </span>
              
              {/* Archive button - hidden by default, visible on hover */}
              <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                  onClick={handleArchive}
                >
                  <Archive className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Unread indicator */}
        {!notification.is_read && (
          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
        )}
      </div>
    </Card>
  );
}
