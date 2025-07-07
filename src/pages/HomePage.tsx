
/**
 * Main homepage/dashboard of the neighborhood app
 * Split layout: Quick Actions at top, Activity Feed left, Notifications right
 */
import { Activity } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import QuickActions from "@/components/QuickActions";
import ActivityFeed from "@/components/activity/ActivityFeed";
import { NotificationsList } from "@/notifications/NotificationsList";

const HomePage = () => {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Quick Actions Section */}
          <section>
            <QuickActions />
          </section>

          <Separator className="my-2 bg-gray-200" />

          {/* Split Layout: Activity Feed + Notifications */}
          <section className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-300px)]">
              {/* Left Column: Activity Feed */}
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="h-6 w-6" />
                  Neighborhood Activity
                </h2>
                <div className="flex-1 overflow-hidden">
                  <ActivityFeed />
                </div>
              </div>
              
              {/* Right Column: Notifications */}
              <div className="flex flex-col">
                <NotificationsList />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
