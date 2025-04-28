
import { HighlightableItemType } from "@/utils/highlightNavigation";
import { BaseNotification } from "@/hooks/notifications/types";
import DefaultNotificationItem from "./items/DefaultNotificationItem";
import { SkillNotificationItem } from "./items/SkillNotificationItem";
import { useState } from "react";

interface NotificationItemProps {
  title: string;
  type: HighlightableItemType; // Using HighlightableItemType instead of string
  itemId: string;
  isRead?: boolean;
  isArchived?: boolean;
  onClose: () => void;
  onArchive: (e: React.MouseEvent) => void; 
  onItemClick: (type: HighlightableItemType, id: string) => void;
  context?: BaseNotification['context']; // Using BaseNotification's context type
}

const NotificationItem = (props: NotificationItemProps) => {
  // Render skill notifications with special handling
  if (props.type === 'skills' && props.context?.contextType === 'skill_request') {
    // Pass only the properties that SkillNotificationItem expects
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

  // For all other notifications, use the default item
  return (
    <DefaultNotificationItem {...props} />
  );
};

export default NotificationItem;
