
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { BaseNotification } from '@/hooks/notifications';
import { formatDistanceToNow } from 'date-fns';
import { SkillNotificationItem as SkillNotification } from './items'; // Import from index barrel

/**
 * Props for a notification item component
 */
interface NotificationItemProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

/**
 * Component to display a notification item
 * Now with improved error handling
 */
const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onDismiss }) => {
  const navigate = useNavigate();
  
  // Format the relative time with error handling
  const getRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'some time ago';
    }
  };
  
  // Safely handle navigation actions
  const handleAction = () => {
    try {
      // Check if we have content to navigate to
      if (notification.content_type && notification.content_id) {
        // Navigate based on content type
        switch (notification.content_type) {
          case 'skills_exchange':
            navigate(`/skills?highlight=${notification.content_id}`);
            break;
          case 'events':
            navigate(`/calendar?highlight=${notification.content_id}`);
            break;
          case 'safety_updates':
            navigate(`/safety?highlight=${notification.content_id}`);
            break;
          case 'goods_exchange':
            navigate(`/goods?highlight=${notification.content_id}`);
            break;
          default:
            navigate('/');
        }
      }
      
      // Call dismiss callback if provided
      if (onDismiss) onDismiss();
    } catch (error) {
      console.error('Error handling notification action:', error);
    }
  };
  
  // For skill notifications, render the specialized component
  if (notification.notification_type === 'skills') {
    // Use a try-catch to prevent any rendering errors
    try {
      return (
        <SkillNotification
          id={notification.id}
          title={notification.title}
          userName={notification.profiles?.display_name || 'Unknown user'}
          userAvatar={notification.profiles?.avatar_url}
          userInitials={(notification.profiles?.display_name?.[0] || '?').toUpperCase()}
          timestamp={getRelativeTime(notification.created_at)}
          skillId={notification.content_id}
          isRead={notification.is_read}
          onAction={onDismiss}
        />
      );
    } catch (error) {
      console.error('Error rendering skill notification:', error);
      // Fall back to default notification rendering
    }
  }
  
  // Default notification rendering with error prevention
  return (
    <div 
      className={`p-3 rounded-lg border mb-2 cursor-pointer hover:bg-gray-50 transition-colors ${!notification.is_read ? 'border-blue-200 bg-blue-50' : ''}`}
      onClick={handleAction}
    >
      <div className="flex items-start gap-3">
        {/* Avatar section with error handling */}
        <Avatar className="h-8 w-8">
          <AvatarImage src={notification.profiles?.avatar_url || undefined} />
          <AvatarFallback>
            {notification.profiles?.display_name?.[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        
        {/* Content section */}
        <div className="flex-1">
          <p className="text-sm font-medium">{notification.title}</p>
          <p className="text-xs text-gray-500">
            {notification.profiles?.display_name || 'Unknown'} • {getRelativeTime(notification.created_at)}
          </p>
        </div>
        
        {/* Action button */}
        <Button size="sm" variant="ghost" className="text-xs h-7">
          {notification.action_label || 'View'}
        </Button>
      </div>
    </div>
  );
};

export default NotificationItem;
