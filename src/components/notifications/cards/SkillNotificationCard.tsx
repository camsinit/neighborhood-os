
/**
 * SkillNotificationCard.tsx
 * 
 * Component for rendering skill-specific notifications
 * Uses simple language like "[name] shared [skill]"
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
 * Component for rendering skill notifications with simple language
 */
const SkillNotificationCard: React.FC<SkillNotificationCardProps> = ({ notification, onDismiss }) => {
  // Extract context info if available
  const context = notification.context || {};
  
  // Get actor name with fallback
  const neighborName = context.neighborName || 
    notification.profiles?.display_name || 
    'A neighbor';
  
  // Create simple, clean title for the notification
  const createSimpleTitle = () => {
    // Extract skill name from title or context
    const skillTitle = notification.title.replace(/^(.+?) (requested|confirmed|completed|scheduled|cancelled|is sharing|shared)\s*/i, "") || 
      context.skillTitle || 
      "a skill";
    
    // Clean up any redundant text
    const cleanSkillTitle = skillTitle.replace(/^skill:\s*/i, "");
    
    // Use action type to determine the verb
    const actionType = notification.action_type || context.contextType;
    
    // Create simple sentence based on action type
    if (actionType === 'request') {
      return `${neighborName} requested ${cleanSkillTitle}`;
    } else if (actionType === 'confirm' || actionType === 'schedule') {
      return `${neighborName} confirmed ${cleanSkillTitle}`;
    } else if (actionType === 'complete') {
      return `${neighborName} completed ${cleanSkillTitle}`;
    } else if (actionType === 'cancel') {
      return `${neighborName} cancelled ${cleanSkillTitle}`;
    } else {
      // Default to "shared" for any other action
      return `${neighborName} shared ${cleanSkillTitle}`;
    }
  };
  
  // Create simple title
  const simpleTitle = createSimpleTitle();
  
  // Use our simple title for the notification
  const notificationWithSimpleTitle = {
    ...notification,
    title: simpleTitle
  };
  
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
      notification={notificationWithSimpleTitle}
      onAction={handleViewSkill}
      onDismiss={onDismiss}
    />
  );
};

export default SkillNotificationCard;
