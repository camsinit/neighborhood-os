
// Add this file to fix the NotificationsHeader component props
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export interface NotificationsHeaderProps {
  title: string;
  unreadCount: number;
  onMarkAllRead: () => void;
}

const NotificationsHeader: React.FC<NotificationsHeaderProps> = ({
  title,
  unreadCount,
  onMarkAllRead
}) => {
  return (
    <div className="flex justify-between items-center w-full">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-xs text-gray-500">
          {unreadCount > 0 
            ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` 
            : 'No new notifications'}
        </p>
      </div>
      
      {unreadCount > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onMarkAllRead}
          className="text-xs"
        >
          <Check className="h-3.5 w-3.5 mr-1" />
          Mark all read
        </Button>
      )}
    </div>
  );
};

export default NotificationsHeader;
