
/**
 * HomePage Component
 * 
 * Main dashboard page that displays:
 * 1. Quick actions for common neighborhood tasks
 * 2. Activity feed for recent neighborhood events
 * 3. Notifications for the current user
 * 
 * Note: AI Chat is temporarily commented out
 */
import { Separator } from "@/components/ui/separator";
import QuickActions from "@/components/QuickActions";
import NotificationsSection from "@/components/notifications/NotificationsSection";
import ActivitySection from "@/components/activity/ActivitySection";
// import AIChat from "@/components/ai/AIChat"; // Temporarily commented out

/**
 * Main homepage/dashboard of the neighborhood app
 * Shows activity feed, quick actions, and notifications
 * AI chat is temporarily disabled
 */
const HomePage = () => {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* AI Chat Section - Temporarily commented out 
          <section>
            <div className="h-[350px] bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
              <AIChat />
            </div>
          </section>

          <Separator className="my-2 bg-gray-200" />
          */}

          {/* Main content area with Activity Feed, Quick Actions and Notifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Activity Feed */}
            <div className="space-y-6">
              {/* Activity Section */}
              <ActivitySection />
            </div>

            {/* Right Column - Quick Actions and Notifications */}
            <div className="space-y-6">
              {/* Quick Actions Section */}
              <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Quick Actions</h2>
                <QuickActions />
              </section>

              {/* Notifications Section */}
              <NotificationsSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
