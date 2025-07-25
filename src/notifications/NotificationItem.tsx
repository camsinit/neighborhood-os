
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
  'neighbor': '#8B5FFF'
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
    default:
      return null;
  }
};

export function NotificationItem({ notification, variant = 'drawer' }: NotificationItemProps) {
  const navigate = useNavigate();
  const { markAsRead, archive } = useNotificationActions();

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
              {highlightTitleContent(notification.title, notification.content_type)}
            </div>
            
            {/* Date/Archive toggle on hover */}
            <div className="flex-shrink-0 relative">
              {/* Date - visible by default, hidden on hover */}
              <span className="text-xs text-gray-500 font-medium group-hover:opacity-0 transition-opacity duration-200">
                {timeAgo.replace(' ago', '').replace('about ', '')}
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
