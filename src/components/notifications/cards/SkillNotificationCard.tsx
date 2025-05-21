
/**
 * SkillNotificationCard.tsx
 * 
 * Component for rendering skill-specific notifications
 */
import React from 'react';
import { BaseNotification } from '@/hooks/notifications/types';
import NotificationCard from './base/NotificationCard';
import { highlightItem } from '@/utils/highlight';

interface SkillNotificationCardProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

/**
 * Component for rendering notifications related to skills
 * This handles various skill-related notification types
 */
const SkillNotificationCard: React.FC<SkillNotificationCardProps> = ({ notification, onDismiss }) => {
  // Extract context info if available
  const context = notification.context || {};
  const neighborName = context.neighborName || 'A neighbor';
  
  // Handle viewing the skill details
  const handleViewSkill = () => {
    if (notification.content_id) {
      // Fixed highlightItem call to use proper API
      highlightItem('skills', notification.content_id);
    }
    
    if (onDismiss) onDismiss();
  };

  return (
    <NotificationCard
      notification={notification}
      onAction={handleViewSkill}
      onDismiss={onDismiss}
    />
  );
};

export default SkillNotificationCard;
