
import React from 'react';
import ActivityFeed from "./ActivityFeed";
import NotificationDrawer from "@/components/notifications/NotificationDrawer";

/**
 * Component to display the activity feed section on the homepage
 * Now with Notifications button inline with the section heading
 */
const ActivitySection = () => {
  return (
    <section className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Neighborhood Activity</h2>
        <NotificationDrawer />
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4 w-full">
        <ActivityFeed />
      </div>
    </section>
  );
};

export default ActivitySection;
