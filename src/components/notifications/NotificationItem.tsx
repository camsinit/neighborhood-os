import { HighlightableItemType } from "@/utils/highlightNavigation";
import { BaseNotification } from "@/hooks/notifications/types";
import DefaultNotificationItem from "./items/DefaultNotificationItem";
import { SkillNotificationItem } from "./items/SkillNotificationItem";

interface NotificationItemProps {
  title: string;
  type: HighlightableItemType;
  itemId: string;
  isRead?: boolean;
  isArchived?: boolean;
  onClose: () => void;
  onArchive: (e: React.MouseEvent) => void;
  onItemClick: (type: HighlightableItemType, id: string) => void;
  context?: {
    contextType: string;
    neighborName?: string;
    avatarUrl?: string;
    [key: string]: any;
  };
}

const NotificationItem = (props: NotificationItemProps) => {
  if (props.type === 'skills' && props.context?.contextType === 'skill_request') {
    return (
      <SkillNotificationItem 
        title={props.title}
        itemId={props.itemId}
        context={props.context}
        isRead={props.isRead}
        isArchived={props.isArchived}
        onClose={props.onClose}
        onArchive={props.onArchive}
        onItemClick={(type, id) => props.onItemClick(type as HighlightableItemType, id)}
      />
    );
  }

  return (
    <DefaultNotificationItem {...props} />
  );
};

export default NotificationItem;
