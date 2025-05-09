
/**
 * Main NotificationItem component that delegates to the appropriate
 * specialized notification item component based on type
 */
import { HighlightableItemType } from "@/utils/highlight";
import { BaseNotification } from "@/hooks/notifications/types";
import DefaultNotificationItem from "./items/DefaultNotificationItem";
import { SkillNotificationItem } from "./items/SkillNotificationItem";
import NotificationItem from "./items/NotificationItem"; // Import as default, not named

interface NotificationItemProps {
  notification: BaseNotification;
  onSelect?: () => void;
}

/**
 * Router component that renders the appropriate notification item
 * based on the notification type and context
 */
const NotificationItemRouter = ({ notification, onSelect }: NotificationItemProps) => {
  // For backward compatibility, let's use our existing specialized components 
  // for certain notification types
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
          // Archiving functionality would go here
        }}
        onItemClick={(type, id) => {
          // Use the highlightItem utility from the enhanced component
        }}
      />
    );
  }

  // For all other notifications, use our enhanced notification item component
  return (
    <NotificationItem
      notification={notification}
      onSelect={onSelect}
    />
  );
};

export default NotificationItemRouter;
