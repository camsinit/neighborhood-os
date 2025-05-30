
/**
 * Enhanced Notification Item Component
 * 
 * Universal component with smart navigation and highlighting integration
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Bell, Calendar, Shield, Users, BookOpen, Package, Heart,
  Eye, Archive, AlertTriangle, Loader2
} from 'lucide-react';
import { EnhancedNotification } from '../types';
import { useNotificationActions } from '../hooks/useNotificationActions';
import { getActorDisplayName, getNotificationPriority } from '../utils/formatters';

interface NotificationItemProps {
  notification: EnhancedNotification;
  onUpdate?: () => void;
  variant?: 'popover' | 'drawer' | 'page';
}

/**
 * Get icon for notification content type
 */
const getNotificationIcon = (contentType: string) => {
  switch (contentType) {
    case 'event':
    case 'events':
      return Calendar;
    case 'safety':
    case 'safety_updates':
      return Shield;
    case 'neighbors':
    case 'neighbor_welcome':
      return Users;
    case 'skills':
    case 'skill_sessions':
      return BookOpen;
    case 'goods':
    case 'goods_exchange':
      return Package;
    case 'care':
    case 'care_requests':
      return Heart;
    default:
      return Bell;
  }
};

/**
 * Get color scheme for notification type and priority
 */
const getNotificationColors = (contentType: string, priority: 'low' | 'medium' | 'high') => {
  const baseColors = {
    event: 'blue',
    events: 'blue',
    safety: 'red',
    safety_updates: 'red',
    neighbors: 'green',
    neighbor_welcome: 'green',
    skills: 'purple',
    skill_sessions: 'purple',
    goods: 'orange',
    goods_exchange: 'orange',
    care: 'pink',
    care_requests: 'pink'
  };

  const color = baseColors[contentType as keyof typeof baseColors] || 'gray';
  const intensity = priority === 'high' ? '100' : priority === 'medium' ? '50' : '25';
  
  return {
    bg: `bg-${color}-${intensity}`,
    border: `border-${color}-200`,
    icon: `text-${color}-600`,
    badge: `bg-${color}-100 text-${color}-800`
  };
};

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onUpdate,
  variant = 'drawer'
}) => {
  const { 
    handleViewNotification, 
    archiveNotificationAction, 
    isLoading 
  } = useNotificationActions();

  const Icon = getNotificationIcon(notification.content_type);
  const priority = getNotificationPriority(notification.relevance_score);
  const colors = getNotificationColors(notification.content_type, priority);
  const actorName = getActorDisplayName(notification);
  const isItemLoading = isLoading(notification.id);

  /**
   * Handle view action with smart navigation
   */
  const handleView = async () => {
    const result = await handleViewNotification(notification);
    if (result.success && onUpdate) {
      onUpdate();
    }
  };

  /**
   * Handle archive action
   */
  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await archiveNotificationAction(notification);
    if (result.success && onUpdate) {
      onUpdate();
    }
  };

  return (
    <Card 
      className={`
        transition-all duration-200 hover:shadow-md cursor-pointer
        ${colors.bg} ${colors.border}
        ${notification.is_read ? 'opacity-75' : 'opacity-100'}
        ${variant === 'popover' ? 'p-3' : 'p-4'}
      `}
      onClick={handleView}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={`flex-shrink-0 p-2 rounded-full bg-white ${colors.icon}`}>
          <Icon className="h-4 w-4" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <h4 className={`text-sm font-medium text-gray-900 line-clamp-2 ${!notification.is_read ? 'font-semibold' : ''}`}>
              {notification.title}
            </h4>
            
            {/* Priority indicator */}
            {priority === 'high' && (
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 ml-2" />
            )}
          </div>
          
          {/* Actor info */}
          {notification.actor_profile && (
            <div className="flex items-center space-x-2 mb-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={notification.actor_profile.avatar_url} />
                <AvatarFallback className="text-xs">
                  {actorName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-600">{actorName}</span>
            </div>
          )}
          
          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {notification.timeAgo}
            </span>
            
            <Badge variant="secondary" className={`text-xs ${colors.badge}`}>
              {notification.content_type}
            </Badge>
          </div>
          
          {/* Actions */}
          {variant !== 'popover' && (
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={handleView}
                disabled={isItemLoading || !notification.canNavigate}
              >
                {isItemLoading ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Eye className="h-3 w-3 mr-1" />
                )}
                {notification.action_label || 'View'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 text-gray-500 hover:text-gray-700"
                onClick={handleArchive}
                disabled={isItemLoading}
              >
                <Archive className="h-3 w-3 mr-1" />
                Archive
              </Button>
            </div>
          )}
        </div>
        
        {/* Unread indicator */}
        {!notification.is_read && (
          <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
        )}
      </div>
    </Card>
  );
};

export default NotificationItem;
