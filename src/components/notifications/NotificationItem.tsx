
/**
 * Main NotificationItem component that delegates to the appropriate
 * specialized notification item component based on type
 */
import { HighlightableItemType } from "@/utils/highlight";
import { BaseNotification } from "@/hooks/notifications/types";
import DefaultNotificationItem from "./items/DefaultNotificationItem";
import { SkillNotificationItem } from "./items/SkillNotificationItem";
// Import the minimalist notification item as a default import
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
        title={notification.title}
        itemId={notification.content_id}
        context={notification.context}
        isRead={notification.is_read}
        isArchived={notification.is_archived}
        onClose={onSelect || (() => {})}
        onArchive={(e) => {
          e.preventDefault();
        }}
        onItemClick={() => {}}
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
