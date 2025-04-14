
import React from 'react';
import ActivityFeed from "./ActivityFeed";
import NotificationDrawer from "@/components/notifications/NotificationDrawer";

/**
 * Component to display the activity feed section on the homepage
 * Displays the activity feed directly without a containing div for a more integrated appearance
 */
const ActivitySection = () => {
  return (
    <section className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Neighborhood Activity</h2>
        <NotificationDrawer />
      </div>
      {/* Activity feed is now displayed directly, without the container div */}
      <ActivityFeed />
    </section>
  );
};

export default ActivitySection;
