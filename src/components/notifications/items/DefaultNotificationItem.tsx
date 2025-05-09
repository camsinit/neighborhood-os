
import { HighlightableItemType } from "@/utils/highlight"; // Updated import path
import BaseNotificationItem from "./BaseNotificationItem";

interface DefaultNotificationItemProps {
  title: string;
  type: HighlightableItemType; // Ensure this matches the expected type
  itemId: string;
  isRead?: boolean;
  isArchived?: boolean;
  onClose: () => void;
  onItemClick: (type: HighlightableItemType, id: string) => void; // Ensure parameter type is consistent
  context?: {
    neighborName?: string;
    avatarUrl?: string;
  };
}

/**
 * Default notification item for simple notifications without special handling
 */
const DefaultNotificationItem = (props: DefaultNotificationItemProps) => {
  return (
    <BaseNotificationItem {...props} />
  );
};

export default DefaultNotificationItem;
