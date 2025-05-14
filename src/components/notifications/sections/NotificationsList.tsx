
/**
 * NotificationsList.tsx
 * 
 * Component for displaying a list of notifications in the popover
 */
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotificationCardFactory from "../cards/NotificationCardFactory";
import { BaseNotification } from "@/hooks/notifications/types";

interface NotificationsListProps {
  notifications: BaseNotification[] | undefined;
  isLoading: boolean;
  showArchived: boolean;
  onDismiss: () => void;
}

/**
 * List of notifications with loading and empty states
 */
const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  isLoading,
  showArchived,
  onDismiss
}) => {
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse flex justify-center">
          <div className="h-6 w-6 rounded-full bg-gray-200"></div>
        </div>
        <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
      </div>
    );
  }
  
  if (!notifications?.length) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        {showArchived ? "No archived notifications" : "No new notifications"}
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-[350px] px-2">
      {notifications.map((notification) => (
        <div key={notification.id} className="py-2">
          <NotificationCardFactory
            notification={notification}
            onDismiss={onDismiss}
          />
        </div>
      ))}
    </ScrollArea>
  );
};

export default NotificationsList;
