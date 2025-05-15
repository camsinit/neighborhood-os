
/**
 * DefaultNotificationItem.tsx
 * 
 * A basic notification item component for simple notifications
 */
import { type BaseNotification } from "@/hooks/notifications"; 
import BaseNotificationItem from "./BaseNotificationItem";

/**
 * Props for the DefaultNotificationItem component
 */
interface DefaultNotificationItemProps {
  notification: BaseNotification; // Using proper BaseNotification type
  onDismiss: () => void;
}

/**
 * Default notification item for simple notifications without special handling
 */
const DefaultNotificationItem = ({ notification, onDismiss }: DefaultNotificationItemProps) => {
  // Simply pass the notification to the base component
  return (
    <BaseNotificationItem 
      notification={notification} 
      onDismiss={onDismiss}
    />
  );
};

export default DefaultNotificationItem;
