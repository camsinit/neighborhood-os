
import QuickActions from "@/components/QuickActions";
import { Separator } from "@/components/ui/separator";
import ActivityFeed from "@/components/activity/ActivityFeed";

const HomePage = () => {
  // This is just a placeholder until we implement notifications
  const notifications: any[] = [];

  return (
    <div className="min-h-full w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 space-y-8">
          {/* Quick Actions Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Quick Actions</h2>
            <QuickActions />
          </section>

          <Separator className="my-8 bg-gray-200" />

          {/* Two Column Layout for Notifications and Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Notifications Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Notifications</h2>
              <div className="bg-white rounded-lg shadow-sm p-4 h-[600px]">
                {notifications.length > 0 ? (
                  // Notification items will go here
                  <div>Notifications</div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No new notifications</p>
                  </div>
                )}
              </div>
            </section>

            {/* Neighborhood Activity Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Neighborhood Activity</h2>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <ActivityFeed />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
