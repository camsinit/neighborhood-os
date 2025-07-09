
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
import { formatDistanceToNow } from 'date-fns';
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

// Map content types to module theme colors for highlighting
// This function now uses the same mapping logic as titleHighlighting for consistency
const getThemeColor = (contentType: string): string => {
  // Convert contentType to lowercase for case-insensitive matching
  const type = contentType.toLowerCase();
  
  // Map content types to module types using the same logic as titleHighlighting
  let moduleType: keyof typeof import('@/theme/moduleTheme').moduleThemeColors | undefined;
  
  if (type.includes('event')) {
    moduleType = 'calendar';
  } else if (type.includes('skill')) {
    moduleType = 'skills';
  } else if (type.includes('good')) {
    moduleType = 'goods';
  } else if (type.includes('safety')) {
    moduleType = 'safety';
  } else if (type.includes('neighbor')) {
    moduleType = 'neighbors';
  } else {
    // Handle exact matches for content types like 'events', 'goods', etc.
    switch (type) {
      case 'events':
        moduleType = 'calendar';
        break;
      case 'skills':
      case 'skill_sessions':
        moduleType = 'skills';
        break;
      case 'goods':
        moduleType = 'goods';
        break;
      case 'safety':
        moduleType = 'safety';
        break;
      case 'neighbors':
        moduleType = 'neighbors';
        break;
    }
  }
  
  // Return the theme color for the module type, or default purple
  return moduleType ? getModuleThemeColor(moduleType) : '#6E59A5';
};

// Map content types to highlight types for smart navigation
const getHighlightType = (contentType: string): HighlightableItemType | null => {
  switch (contentType) {
    case 'events':
      return 'event';
    case 'safety':
      return 'safety';
    case 'skills':
    case 'skill_sessions':
      return 'skills';
    case 'goods':
      return 'goods';
    case 'neighbors':
      return 'neighbors';
    default:
      return null;
  }
};

export function NotificationItem({ notification, variant = 'drawer' }: NotificationItemProps) {
  const navigate = useNavigate();
  const { markAsRead, archive } = useNotificationActions();
  
  // State to track if notification is being archived (for animation)
  const [isArchiving, setIsArchiving] = useState(false);

  // Create navigation service instance
  const navigationService = createItemNavigationService(navigate);

  // Get actor info with fallback
  const actorName = notification.profiles?.display_name || 'A neighbor';
  const avatarUrl = notification.profiles?.avatar_url;

  // Format time ago
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

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

  // Handle archive action with slide-out animation
  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      // Start the slide-out animation
      setIsArchiving(true);
      
      // Wait for animation to complete (500ms as defined in CSS)
      setTimeout(async () => {
        try {
          await archive(notification.id);
          toast.success('Notification archived');
        } catch (error) {
          console.error('Error archiving notification:', error);
          toast.error('Failed to archive');
          // Reset animation state on error
          setIsArchiving(false);
        }
      }, 500);
    } catch (error) {
      console.error('Error starting archive animation:', error);
      toast.error('Failed to archive');
      setIsArchiving(false);
    }
  };

  return (
    <Card 
      className={`
        relative p-3 transition-all duration-200 hover:shadow-md cursor-pointer border-l-4 group
        ${!notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white'}
        ${variant === 'popover' ? 'mb-2' : 'mb-3'}
        ${isArchiving ? 'swipe-out-right' : ''}
      `}
      style={{
        borderLeftColor: themeColor
      }}
      onClick={handleCardClick}
    >
      {/* Archive button - appears on hover on the left side */}
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm border border-gray-200"
          onClick={handleArchive}
        >
          <Archive className="h-4 w-4 text-gray-600" />
        </Button>
      </div>

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
          {/* Title and Time */}
          <div className="flex justify-between items-start gap-2">
            <div className={`text-sm leading-tight flex-1 ${!notification.is_read ? 'font-semibold' : 'font-medium'}`}>
              {highlightTitleContent(notification.title, notification.content_type)}
            </div>
            <span className="text-xs text-gray-500 font-medium flex-shrink-0">
              {timeAgo.replace(' ago', '').replace('about ', '')}
            </span>
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
