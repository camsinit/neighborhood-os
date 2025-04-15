
import { Separator } from "@/components/ui/separator";
import QuickActions from "@/components/QuickActions";
import ActivitySection from "@/components/activity/ActivitySection";
import NotificationsSection from "@/components/notifications/NotificationsSection";

const HomePage = () => {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Quick Actions</h2>
            <QuickActions />
          </section>

          {/* Notifications Section */}
          <NotificationsSection />
        </div>

        <Separator className="my-6 bg-gray-200" />

        {/* Activity Section - Below both columns */}
        <ActivitySection />
      </div>
    </div>
  );
};

export default HomePage;
