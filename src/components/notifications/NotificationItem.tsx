
/**
 * Main NotificationItem component that delegates to the appropriate
 * specialized notification item component based on type
 */
import { HighlightableItemType } from "@/utils/highlight";
import { BaseNotification } from "@/hooks/notifications/types";
import DefaultNotificationItem from "./items/DefaultNotificationItem";
import { SkillNotificationItem } from "./items/SkillNotificationItem";
import NotificationItem from "./items/NotificationItem"; // Import the minimalist notification item

interface NotificationItemProps {
  notification: BaseNotification;
  onSelect?: () => void;
}

/**
 * Router component that renders the appropriate notification item
 * using our new minimalist design
 */
const NotificationItemRouter = ({ notification, onSelect }: NotificationItemProps) => {
  // Format notification title with brackets for highlighting
  // This prepares the notification for our highlighting system
  const formatNotificationTitle = (notification: BaseNotification): BaseNotification => {
    // Skip if the notification already has brackets
    if (notification.title.includes("[[")) {
      return notification;
    }
    
    // Different formatting based on notification type
    let formattedTitle = notification.title;
    
    switch (notification.notification_type) {
      case 'event':
        // Highlight event name
        formattedTitle = formattedTitle.replace(/(.*)(shared|updated|created|cancelled|is attending) (.*)/i, 
          '$1$2 [[$3]]');
        break;
      case 'goods':
        // Highlight item name
        formattedTitle = formattedTitle.replace(/(.*)(posted|is offering|is looking for|claimed|removed listing for) (.*)/i, 
          '$1$2 [[$3]]');
        break;
      case 'skills':
        // Highlight skill name
        formattedTitle = formattedTitle.replace(/(.*)(requested|confirmed|completed|scheduled|cancelled) (.*)/i, 
          '$1$2 [[$3]]');
        break;
      case 'safety':
        // Highlight safety update title
        formattedTitle = formattedTitle.replace(/(.*)(reported|posted|shared) (.*)/i, 
          '$1$2 [[$3]]');
        break;
      case 'neighbors':
        // Highlight neighbor name
        formattedTitle = formattedTitle.replace(/(.*)(joined|updated) (.*)/i, 
          '[[$1]]$2 $3');
        break;
    }
    
    // Return notification with updated title
    return {
      ...notification,
      title: formattedTitle
    };
  };

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
  // Apply formatting for highlighting
  const formattedNotification = formatNotificationTitle(notification);
  
  return (
    <NotificationItem
      notification={formattedNotification}
      onSelect={onSelect}
    />
  );
};

export default NotificationItemRouter;
