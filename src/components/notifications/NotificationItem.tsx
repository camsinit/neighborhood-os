
import { HighlightableItemType } from "@/utils/highlightNavigation";
import { BaseNotification } from "@/hooks/notifications/types";
import DefaultNotificationItem from "./items/DefaultNotificationItem";
import SkillNotificationItem from "./items/SkillNotificationItem";
import { useState } from "react";

interface NotificationItemProps {
  title: string;
  type: HighlightableItemType;
  itemId: string;
  isRead?: boolean;
  isArchived?: boolean;
  onClose: () => void;
  onItemClick: (type: HighlightableItemType, id: string) => void;
  context?: BaseNotification['context'];
}

/**
 * NotificationItem component that renders different notification types
 */
const NotificationItem = (props: NotificationItemProps) => {
  // Render skill notifications with special handling
  if (props.type === 'skills' && props.context?.contextType === 'skill_request') {
    return (
      <SkillNotificationItem {...props} />
    );
  }

  // For all other notifications, use the default item
  return (
    <DefaultNotificationItem {...props} />
  );
};

export default NotificationItem;
