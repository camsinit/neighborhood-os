
/**
 * Main NotificationItem component that delegates to the appropriate
 * specialized notification item component based on type
 */
// Fix import to use the correct path for HighlightableItemType
import { type HighlightableItemType } from '@/utils/highlight/types';
import { BaseNotification } from "@/hooks/notifications/types";
import DefaultNotificationItem from "./items/DefaultNotificationItem";
import SkillNotificationItem from "./items/SkillNotificationItem";
import NotificationItem from "./items/NotificationItem"; 

interface NotificationItemProps {
  notification: BaseNotification;
  onSelect?: () => void;
}

/**
 * Router component that renders the appropriate notification item
 * using our new minimalist design
 */
const NotificationItemRouter = ({ notification, onSelect }: NotificationItemProps) => {
  // For backward compatibility with specialized components
  if (notification.notification_type === 'skills' && notification.context?.contextType === 'skill_request') {
    return (
      <SkillNotificationItem 
        notification={notification}
        onDismiss={onSelect || (() => {})}
      />
    );
  }

  // For all other notifications, use our enhanced notification item component with new design
  return (
    <NotificationItem
      notification={notification}
      onSelect={onSelect}
    />
  );
};

export default NotificationItemRouter;
