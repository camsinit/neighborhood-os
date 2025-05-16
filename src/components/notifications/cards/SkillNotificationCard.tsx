
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
 * This handles various skill-related notification types with proper sentence formatting
 */
const SkillNotificationCard: React.FC<SkillNotificationCardProps> = ({ notification, onDismiss }) => {
  // Extract context info if available
  const context = notification.context || {};
  const neighborName = context.neighborName || notification.profiles?.display_name || 'A neighbor';
  const skillTitle = context.skillTitle || notification.title || 'a skill';
  
  // Create a properly formatted title based on action type
  const createFormattedTitle = () => {
    const actionType = notification.action_type || 'view';
    
    switch (actionType) {
      case 'request':
        return `${neighborName} requested ${skillTitle}`;
      case 'confirm':
        return `${neighborName} confirmed ${skillTitle}`;
      case 'cancel':
        return `${neighborName} cancelled ${skillTitle}`;
      case 'complete':
        return `${neighborName} completed ${skillTitle}`;
      case 'share':
        return `${neighborName} is sharing ${skillTitle}`;
      case 'update':
        return `${neighborName} updated ${skillTitle}`;
      default:
        return notification.title || `${neighborName} interested in a skill`;
    }
  };
  
  // Create formatted notification with proper sentence structure
  const formattedNotification = {
    ...notification,
    title: createFormattedTitle()
  };
  
  // Handle viewing the skill details
  const handleViewSkill = () => {
    if (notification.content_id) {
      highlightItem('skill', notification.content_id);
    }
    
    if (onDismiss) onDismiss();
  };

  return (
    <NotificationCard
      notification={formattedNotification}
      onAction={handleViewSkill}
      onDismiss={onDismiss}
    />
  );
};

export default SkillNotificationCard;
