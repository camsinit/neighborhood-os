import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { NotificationCard, NotificationCardProps } from "./base/NotificationCard";
import { EventNotificationCard } from "./EventNotificationCard";
import { SafetyNotificationCard } from "./SafetyNotificationCard";
import { SkillNotificationCard } from "./SkillNotificationCard";
import { GoodsNotificationCard } from "./GoodsNotificationCard";
import { NeighborNotificationCard } from "./NeighborNotificationCard";

interface NotificationCardFactoryProps extends NotificationCardProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

export const NotificationCardFactory: React.FC<NotificationCardFactoryProps> = (props) => {
  const { notification } = props;

  // Based on notification type, return the appropriate card
  switch (notification.notification_type) {
    case "event":
      return <EventNotificationCard {...props} />;
    case "safety":
      return <SafetyNotificationCard {...props} />;
    case "skills":
      return <SkillNotificationCard {...props} />;
    case "goods":
      return <GoodsNotificationCard {...props} />;
    case "neighbor_welcome":
    case "neighbors":
      return <NeighborNotificationCard {...props} />;
    default:
      // Default to the base card
      return <NotificationCard {...props} />;
  }
};
