
import { Separator } from "@/components/ui/separator";
import QuickActions from "@/components/QuickActions";
import ActivitySection from "@/components/activity/ActivitySection";
import NotificationDrawer from "@/components/notifications/NotificationDrawer";
import ActivityFeed from "@/components/activity/ActivityFeed";
import { NotificationDebugPanel } from "@/components/notifications/debug";

/**
 * Main homepage/dashboard of the neighborhood app
 * Reorganized layout with quick actions at top, activity feed below
 * Note: The Quick Actions title has been moved to the Header component
 */
const HomePage = () => {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Quick Actions Section with no heading (moved to Header) */}
          <section>
            <QuickActions />
          </section>

          <Separator className="my-2 bg-gray-200" />

          {/* Activity Section */}
          <section className="w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Neighborhood Activity</h2>
            <ActivityFeed />
          </section>
        </div>
      </div>
      
      {/* Debug panel - only rendered in development */}
      {process.env.NODE_ENV !== 'production' && <NotificationDebugPanel />}
    </div>
  );
};

export default HomePage;
