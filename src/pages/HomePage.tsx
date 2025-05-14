import { Separator } from "@/components/ui/separator";
import QuickActions from "@/components/QuickActions";
import ActivityFeed from "@/components/activity/ActivityFeed";
import { NotificationsDebug } from "@/components/notifications/debug/NotificationsDebug"; // Import the debug component

/**
 * Main homepage/dashboard of the neighborhood app
 * Reorganized layout with quick actions at top, activity feed below
 * Now with more visible debug tools in development mode
 */
const HomePage = () => {
  // Check if we're in development mode to show debug tools
  const isDev = import.meta.env.DEV;
  return <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Debug tools in development - more prominently positioned */}
          {isDev}

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
    </div>;
};
export default HomePage;