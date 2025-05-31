
/**
 * Universal Notification Item Component
 * 
 * Handles all notification types with smart navigation integration
 * Now includes theme-based color highlighting for content and borders
 */
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Eye, Archive, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { NotificationWithProfile } from './types';
import { useNotificationActions } from './useNotifications';
import { navigateAndHighlight } from '@/utils/highlight/navigateAndHighlight';
import { HighlightableItemType } from '@/utils/highlight/types';
import { highlightTitleContent } from '@/utils/highlight/titleHighlighting';
import { getModuleThemeColor } from '@/theme/moduleTheme';

interface NotificationItemProps {
  notification: NotificationWithProfile;
  variant?: 'popover' | 'drawer';
}

// Map content types to module theme colors for highlighting
const getThemeColor = (contentType: string): string => {
  switch (contentType) {
    case 'events':
      return getModuleThemeColor('calendar');
    case 'safety':
      return getModuleThemeColor('safety');
    case 'skills':
    case 'skill_sessions':
      return getModuleThemeColor('skills');
    case 'goods':
      return getModuleThemeColor('goods');
    case 'neighbors':
      return getModuleThemeColor('neighbors');
    default:
      return '#6E59A5'; // Default purple
  }
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

// Simple route mapping for content types
const getRoute = (contentType: string): string => {
  switch (contentType) {
    case 'events':
      return '/calendar';
    case 'safety':
      return '/safety';
    case 'skills':
    case 'skill_sessions':
      return '/skills';
    case 'goods':
      return '/goods';
    case 'neighbors':
      return '/neighbors';
    default:
      return '/home';
  }
};

export function NotificationItem({ notification, variant = 'drawer' }: NotificationItemProps) {
  const navigate = useNavigate();
  const { markAsRead, archive } = useNotificationActions();

  // Get actor info with fallback
  const actorName = notification.profiles?.display_name || 'A neighbor';
  const avatarUrl = notification.profiles?.avatar_url;

  // Format time ago
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

  // Get theme color for this notification's content type
  const themeColor = getThemeColor(notification.content_type);

  // Handle view action with smart navigation
  const handleView = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      // Mark as read
      if (!notification.is_read) {
        await markAsRead(notification.id);
      }

      // Smart navigation with highlighting
      const highlightType = getHighlightType(notification.content_type);
      if (highlightType && notification.content_id) {
        // Use smart navigation to route and highlight
        navigateAndHighlight(highlightType, notification.content_id, navigate, true);
      } else {
        // Fallback to simple route navigation
        navigate(getRoute(notification.content_type));
      }

      toast.success('Navigated to content');
    } catch (error) {
      console.error('Error viewing notification:', error);
      toast.error('Failed to navigate');
    }
  };

  // Handle archive action
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
        p-3 transition-all duration-200 hover:shadow-md cursor-pointer border-l-4
        ${!notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white'}
        ${variant === 'popover' ? 'mb-2' : 'mb-3'}
      `}
      style={{
        borderLeftColor: themeColor
      }}
      onClick={handleView}
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
          {/* Title - Using template from backend with color highlighting */}
          <div className={`text-sm leading-tight ${!notification.is_read ? 'font-semibold' : 'font-medium'}`}>
            {highlightTitleContent(notification.title, notification.content_type)}
          </div>
          
          {/* Time */}
          <p className="text-xs text-gray-500 mt-1">
            {timeAgo}
          </p>
          
          {/* Actions for drawer variant */}
          {variant === 'drawer' && (
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={handleView}
              >
                <Eye className="h-3 w-3 mr-1" />
                {notification.action_label}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-gray-500"
                onClick={handleArchive}
              >
                <Archive className="h-3 w-3 mr-1" />
                Archive
              </Button>
            </div>
          )}
        </div>
        
        {/* Unread indicator */}
        {!notification.is_read && (
          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
        )}
      </div>
    </Card>
  );
}
