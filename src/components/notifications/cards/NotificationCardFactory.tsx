
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

interface NotificationCardFactoryProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

// Component for creating the appropriate notification card based on type
export const NotificationCardFactory = ({ 
  notification,
  onDismiss
}: NotificationCardFactoryProps) => {
  // Choose the appropriate card component based on notification type
  switch (notification.notification_type) {
    case 'event':
      return <EventNotificationCard notification={notification} onDismiss={onDismiss} />;
    case 'safety':
      return <SafetyNotificationCard notification={notification} onDismiss={onDismiss} />;
    case 'goods':
      return <GoodsNotificationCard notification={notification} onDismiss={onDismiss} />;
    case 'skills':
      return <SkillNotificationCard notification={notification} onDismiss={onDismiss} />;
    case 'neighbor_welcome':
      return <NeighborNotificationCard notification={notification} onDismiss={onDismiss} />;
    default:
      // Fallback to generic notification card
      return (
        <NotificationCard
          notification={notification}
          onDismiss={onDismiss}
        />
      );
  }
};

export default NotificationCardFactory;
