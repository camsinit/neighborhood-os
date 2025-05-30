
/**
 * Universal Notification Item Component
 * 
 * This component handles displaying all types of notifications in a consistent format
 * while supporting the new templated notification system with natural language.
 * 
 * Each notification type has specific styling and actions based on its content and relevance.
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Bell, 
  Calendar, 
  Shield, 
  Users, 
  BookOpen, 
  Package, 
  Heart,
  Eye,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { BaseNotification } from "@/hooks/notifications/types";
import { markAsRead, archiveNotification } from "@/hooks/notifications/notificationActions";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createLogger } from "@/utils/logger";

const logger = createLogger('NotificationItem');

// Props interface for the NotificationItem component
interface NotificationItemProps {
  notification: BaseNotification;
  onUpdate?: () => void; // Callback to refresh notifications after actions
}

/**
 * Gets the appropriate icon for each notification type
 * Uses specific icons to help users quickly identify notification categories
 */
const getNotificationIcon = (type: string, actionType?: string) => {
  // Handle specific action types first
  if (actionType === 'comment') return MessageCircle;
  if (actionType === 'rsvp') return CheckCircle;
  
  // Then handle content types
  switch (type) {
    case 'events':
    case 'event':
      return Calendar;
    case 'safety':
      return Shield;
    case 'neighbors':
    case 'neighbor_welcome':
      return Users;
    case 'skills':
    case 'skill_sessions':
      return BookOpen;
    case 'goods':
      return Package;
    case 'care':
      return Heart;
    default:
      return Bell;
  }
};

/**
 * Gets the appropriate color scheme for each notification type
 * Uses consistent colors across the app for different content types
 */
const getNotificationColors = (type: string, relevanceScore?: number) => {
  // High relevance notifications get more prominent colors
  const isHighRelevance = relevanceScore && relevanceScore >= 3;
  
  switch (type) {
    case 'events':
    case 'event':
      return {
        bg: isHighRelevance ? 'bg-blue-50' : 'bg-blue-25',
        border: isHighRelevance ? 'border-blue-200' : 'border-blue-100',
        icon: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-800'
      };
    case 'safety':
      return {
        bg: isHighRelevance ? 'bg-red-50' : 'bg-red-25',
        border: isHighRelevance ? 'border-red-200' : 'border-red-100',
        icon: 'text-red-600',
        badge: 'bg-red-100 text-red-800'
      };
    case 'neighbors':
    case 'neighbor_welcome':
      return {
        bg: 'bg-green-50',
        border: 'border-green-100',
        icon: 'text-green-600',
        badge: 'bg-green-100 text-green-800'
      };
    case 'skills':
    case 'skill_sessions':
      return {
        bg: isHighRelevance ? 'bg-purple-50' : 'bg-purple-25',
        border: isHighRelevance ? 'border-purple-200' : 'border-purple-100',
        icon: 'text-purple-600',
        badge: 'bg-purple-100 text-purple-800'
      };
    case 'goods':
      return {
        bg: isHighRelevance ? 'bg-orange-50' : 'bg-orange-25',
        border: isHighRelevance ? 'border-orange-200' : 'border-orange-100',
        icon: 'text-orange-600',
        badge: 'bg-orange-100 text-orange-800'
      };
    case 'care':
      return {
        bg: isHighRelevance ? 'bg-pink-50' : 'bg-pink-25',
        border: isHighRelevance ? 'border-pink-200' : 'border-pink-100',
        icon: 'text-pink-600',
        badge: 'bg-pink-100 text-pink-800'
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-100',
        icon: 'text-gray-600',
        badge: 'bg-gray-100 text-gray-800'
      };
  }
};

/**
 * Gets the display label for notification types
 * Provides user-friendly labels for different notification categories
 */
const getTypeLabel = (type: string, actionType?: string) => {
  if (actionType === 'comment') return 'Comment';
  if (actionType === 'rsvp') return 'RSVP';
  
  switch (type) {
    case 'events':
    case 'event':
      return 'Event';
    case 'safety':
      return 'Safety';
    case 'neighbors':
    case 'neighbor_welcome':
      return 'Neighbor';
    case 'skills':
    case 'skill_sessions':
      return 'Skills';
    case 'goods':
      return 'Goods';
    case 'care':
      return 'Care';
    default:
      return 'Notification';
  }
};

/**
 * Main NotificationItem component
 * Renders a single notification with appropriate styling, actions, and navigation
 */
const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onUpdate 
}) => {
  const navigate = useNavigate();
  
  // Get styling based on notification type and relevance
  const colors = getNotificationColors(notification.content_type, notification.relevance_score);
  const Icon = getNotificationIcon(notification.content_type, notification.action_type);
  const typeLabel = getTypeLabel(notification.content_type, notification.action_type);
  
  // Format the creation date for display
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });
  
  /**
   * Handles clicking on the notification
   * Marks as read and navigates to the appropriate page/content
   */
  const handleNotificationClick = async () => {
    try {
      // Mark notification as read if it isn't already
      if (!notification.is_read) {
        const success = await markAsRead(notification.id);
        if (success && onUpdate) onUpdate();
      }
      
      // Navigate based on content type
      switch (notification.content_type) {
        case 'events':
        case 'event':
          navigate('/calendar');
          break;
        case 'safety':
          navigate('/safety');
          break;
        case 'neighbors':
        case 'neighbor_welcome':
          navigate('/neighbors');
          break;
        case 'skills':
        case 'skill_sessions':
          navigate('/skills');
          break;
        case 'goods':
          navigate('/goods');
          break;
        case 'care':
          navigate('/care');
          break;
        default:
          navigate('/');
      }
      
      logger.debug('Navigated to appropriate page for notification type:', notification.content_type);
    } catch (error) {
      logger.error('Error handling notification click:', error);
      toast.error('Failed to open notification');
    }
  };
  
  /**
   * Handles archiving a notification
   * Removes it from the active notifications list
   */
  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the main click handler
    
    try {
      const success = await archiveNotification(notification.id);
      if (success && onUpdate) {
        onUpdate();
        toast.success('Notification archived');
      } else {
        toast.error('Failed to archive notification');
      }
    } catch (error) {
      logger.error('Error archiving notification:', error);
      toast.error('Failed to archive notification');
    }
  };
  
  return (
    <Card 
      className={`
        p-4 cursor-pointer transition-all duration-200 hover:shadow-md
        ${colors.bg} ${colors.border}
        ${notification.is_read ? 'opacity-75' : 'opacity-100'}
      `}
      onClick={handleNotificationClick}
    >
      <div className="flex items-start space-x-3">
        {/* Notification Icon */}
        <div className={`flex-shrink-0 p-2 rounded-full bg-white ${colors.icon}`}>
          <Icon className="h-4 w-4" />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header with title and badge */}
          <div className="flex items-start justify-between mb-1">
            <h4 className={`text-sm font-medium text-gray-900 ${!notification.is_read ? 'font-semibold' : ''}`}>
              {notification.title}
            </h4>
            <Badge variant="secondary" className={`text-xs ${colors.badge}`}>
              {typeLabel}
            </Badge>
          </div>
          
          {/* Metadata and timestamp */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {timeAgo}
            </span>
            
            {/* Relevance indicator for high-importance notifications */}
            {notification.relevance_score && notification.relevance_score >= 3 && (
              <div className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                <span className="text-xs text-amber-600 font-medium">High Priority</span>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center justify-between mt-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleNotificationClick}
            >
              {notification.action_label || 'View'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={handleArchive}
            >
              Archive
            </Button>
          </div>
        </div>
        
        {/* Unread indicator */}
        {!notification.is_read && (
          <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
        )}
      </div>
    </Card>
  );
};

export default NotificationItem;
