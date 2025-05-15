
/**
 * A factory component that renders the appropriate notification card 
 * based on the notification type
 */
import React from 'react';
import { BaseNotification } from '@/hooks/notifications/types';
import EventNotificationCard from './EventNotificationCard';
import SafetyNotificationCard from './SafetyNotificationCard';
import GoodsNotificationCard from './GoodsNotificationCard';
import SkillNotificationCard from './SkillNotificationCard';
import NeighborNotificationCard from './NeighborNotificationCard';
import NotificationCard from './base/NotificationCard';

// Component for creating the appropriate notification card based on type
export const NotificationCardFactory = ({ 
  notification 
}: { 
  notification: BaseNotification 
}) => {
  // Choose the appropriate card component based on notification type
  switch (notification.notification_type) {
    case 'event':
      return <EventNotificationCard notification={notification} />;
    case 'safety':
      return <SafetyNotificationCard notification={notification} />;
    case 'goods':
      return <GoodsNotificationCard notification={notification} />;
    case 'skills':
      return <SkillNotificationCard notification={notification} />;
    case 'neighbor_welcome':
      return <NeighborNotificationCard notification={notification} />;
    default:
      // Fallback to generic notification card
      return (
        <NotificationCard
          title={notification.title}
          description={notification.description || ""}
          timestamp={notification.created_at}
          isRead={notification.is_read}
          actionLabel={notification.action_label}
          id={notification.id}
        />
      );
  }
};
