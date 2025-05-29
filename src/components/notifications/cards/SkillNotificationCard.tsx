
/**
 * SkillNotificationCard.tsx
 * 
 * Component for rendering skill-specific notifications
 * Now with clean language highlighting skill names in green
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
 * Component for rendering skill notifications with clean highlighting
 */
const SkillNotificationCard: React.FC<SkillNotificationCardProps> = ({ 
  notification, 
  onDismiss 
}) => {
  // Handle viewing the skill details
  const handleViewSkill = () => {
    if (notification.content_id) {
      // Navigate to skill
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
