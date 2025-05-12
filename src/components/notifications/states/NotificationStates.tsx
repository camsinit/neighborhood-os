
/**
 * NotificationStates.tsx
 * 
 * Components for different notification states (empty, loading)
 */
import React from "react";
import { BellRing, Clock } from "lucide-react";

/**
 * Loading state for notifications
 */
export const NotificationsLoadingState: React.FC = () => {
  return (
    <div className="p-8 text-center">
      <Clock className="mx-auto h-8 w-8 animate-spin text-gray-400" />
      <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
    </div>
  );
};

/**
 * Empty state for when there are no notifications
 * 
 * @param showArchived - Whether we're in the archived view
 */
export const NotificationsEmptyState: React.FC<{ showArchived: boolean }> = ({ showArchived }) => {
  return (
    <div className="p-8 text-center">
      <BellRing className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900">No notifications</h3>
      <p className="mt-1 text-sm text-gray-500">
        {showArchived 
          ? "No archived notifications to show" 
          : "You'll receive notifications for activities that directly involve you"}
      </p>
      <p className="mt-1 text-sm text-gray-500">
        {!showArchived && "For general neighborhood updates, check the activity feed"}
      </p>
    </div>
  );
};
