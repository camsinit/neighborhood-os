
import { HighlightableItemType } from "@/utils/highlightNavigation";
import BaseNotificationItem from "./BaseNotificationItem";

interface DefaultNotificationItemProps {
  title: string;
  type: HighlightableItemType;
  itemId: string;
  isRead?: boolean;
  isArchived?: boolean;
  onClose: () => void;
  onItemClick: (type: HighlightableItemType, id: string) => void;
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
