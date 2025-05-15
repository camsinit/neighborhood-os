
/**
 * SkillNotificationCard.tsx
 * 
 * Component for rendering skill-specific notifications
 */
import React from 'react';
import { BaseNotification } from '@/hooks/notifications/types';
import NotificationCard from './base/NotificationCard';
import { Lightbulb } from 'lucide-react';

interface SkillNotificationCardProps {
  notification: BaseNotification;
}

/**
 * Component for rendering notifications related to skills
 * This handles various skill-related notification types
 */
const SkillNotificationCard: React.FC<SkillNotificationCardProps> = ({ notification }) => {
  // Extract context info if available
  const context = notification.context || {};
  const neighborName = context.neighborName || 'A neighbor';
  
  // Create a descriptive message based on action type
  let description = '';
  let icon = <Lightbulb className="h-5 w-5 text-purple-500" />;
  
  // Generate appropriate description based on action type
  switch (notification.action_type) {
    case 'request':
      description = `${neighborName} has requested your skills for ${context.skillTitle || 'a session'}`;
      break;
    case 'confirm':
      description = `A skill session for ${context.skillTitle || 'your request'} has been confirmed`;
      break;
    case 'schedule':
      description = `New time slots are available for your skill request`;
      break;
    case 'reschedule':
      description = `A skill session has been rescheduled`;
      break;
    case 'cancel':
      description = `A skill session for ${context.skillTitle || 'your request'} was cancelled`;
      break;
    case 'complete':
      description = `A skill session has been marked as completed`;
      break;
    default:
      description = notification.description || `New activity related to ${context.skillTitle || 'skills sharing'}`;
  }

  return (
    <NotificationCard
      title={notification.title}
      description={description}
      timestamp={notification.created_at}
      isRead={notification.is_read}
      actionLabel={notification.action_label}
      id={notification.id}
      icon={icon}
      avatarUrl={context.avatarUrl}
      actorName={neighborName}
    />
  );
};

export default SkillNotificationCard;
