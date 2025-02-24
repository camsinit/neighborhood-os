import QuickActions from "@/components/QuickActions";
import { Separator } from "@/components/ui/separator";
import ActivityFeed from "@/components/activity/ActivityFeed";

const HomePage = () => {
  return (
    <div className="min-h-full w-full bg-gradient-to-b from-[#F8E8FF] via-[#FFE7E7] via-[#FFF4E4] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 space-y-8">
          {/* Quick Actions Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Quick Actions</h2>
            <QuickActions />
          </section>

          <Separator className="my-8 bg-gray-200" />

          {/* Notifications Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Notifications</h2>
            <div className="bg-white rounded-lg shadow-sm p-4">
              
            </div>
          </section>

          <Separator className="my-8 bg-gray-200" />

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
  );
};

export default HomePage;
