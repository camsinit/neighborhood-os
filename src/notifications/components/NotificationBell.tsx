
/**
 * Notification Bell Component
 * 
 * Simple bell icon with unread count badge for the main navigation
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { useUnreadCount } from '../hooks/useNotifications';

interface NotificationBellProps {
  onClick?: () => void;
  variant?: 'icon' | 'button';
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  onClick,
  variant = 'icon',
  className = ''
}) => {
  const { data: unreadCount = 0 } = useUnreadCount();

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size="lg"
        className={`relative flex items-center gap-2 ${className}`}
        onClick={onClick}
      >
        <Bell className="h-5 w-5" />
        <span className="hidden sm:inline">Notifications</span>
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`relative ${className}`}
      onClick={onClick}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};

export default NotificationBell;
