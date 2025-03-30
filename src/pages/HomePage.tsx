
/**
 * HomePage Component
 * 
 * Main dashboard page that displays:
 * 1. Quick actions for common neighborhood tasks
 * 2. Notifications for the current user
 * 3. Recent activity feed from the neighborhood
 * 
 * This component has been refactored to use smaller, more focused components
 * for better maintainability and code organization.
 */
import { Separator } from "@/components/ui/separator";
import QuickActions from "@/components/QuickActions";
import NotificationsSection from "@/components/notifications/NotificationsSection";
import ActivitySection from "@/components/activity/ActivitySection";

/**
 * Main homepage/dashboard of the neighborhood app
 * Shows quick actions, notifications, and recent activity
 */
const HomePage = () => {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-8">
          {/* Quick Actions Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Quick Actions</h2>
            <QuickActions />
          </section>

          <Separator className="my-8 bg-gray-200" />

          {/* Two Column Layout for Notifications and Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Notifications Section - Now a separate component */}
            <NotificationsSection />

            {/* Neighborhood Activity Section - Now a separate component */}
            <ActivitySection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
