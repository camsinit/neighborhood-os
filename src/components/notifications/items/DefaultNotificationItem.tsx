
import { type HighlightableItemType } from "@/utils/highlight"; 
import BaseNotificationItem from "./BaseNotificationItem";

/**
 * Props for the DefaultNotificationItem component
 */
interface DefaultNotificationItemProps {
  notification: {
    id: string;
    title: string;
    content_type: HighlightableItemType;
    content_id: string;
    is_read?: boolean;
    is_archived?: boolean;
    context?: {
      neighborName?: string;
      avatarUrl?: string;
    };
  };
  onDismiss: () => void;
}

/**
 * Default notification item for simple notifications without special handling
 */
const DefaultNotificationItem = ({ notification, onDismiss }: DefaultNotificationItemProps) => {
  return (
    <BaseNotificationItem 
      notification={notification} 
      onDismiss={onDismiss}
    />
  );
};

export default DefaultNotificationItem;
