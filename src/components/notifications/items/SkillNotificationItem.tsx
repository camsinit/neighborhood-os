
import React from 'react';
import { BaseNotification } from '@/hooks/notifications/types';
import BaseNotificationItem from './BaseNotificationItem';
import { highlightItem } from '@/utils/highlight';

interface SkillNotificationItemProps {
  notification: BaseNotification;
  onDismiss: () => void;
}

const SkillNotificationItem: React.FC<SkillNotificationItemProps> = ({ 
  notification, 
  onDismiss 
}) => {
  // Extract metadata
  const metadata = notification?.context || {};
  
  // Handle view action
  const handleView = async () => {
    // Mark as read and navigate
    if (notification.content_id) {
      // Fixed highlightItem call to use proper API
      highlightItem('skill', notification.content_id);
      onDismiss();
    }
  };
  
  return (
    <BaseNotificationItem
      notification={notification}
      onDismiss={onDismiss}
    />
  );
};

export default SkillNotificationItem;
