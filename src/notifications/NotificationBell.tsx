
/**
 * Notification Bell Component
 * 
 * Simple bell icon with unread count badge
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { useUnreadCount } from './useNotifications';

interface NotificationBellProps {
  onClick?: () => void;
  className?: string;
}

export function NotificationBell({ onClick, className = '' }: NotificationBellProps) {
  const { data: unreadCount = 0 } = useUnreadCount();

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
}
