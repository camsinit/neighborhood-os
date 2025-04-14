
/**
 * HomePage Component
 * 
 * Main dashboard page that displays:
 * 1. Quick actions for common neighborhood tasks (full width at top)
 * 2. Activity feed for recent neighborhood events (below quick actions)
 * 3. Notifications accessed via a button at the top right
 * 
 * Note: AI Chat is temporarily commented out
 */
import { Separator } from "@/components/ui/separator";
import QuickActions from "@/components/QuickActions";
import ActivitySection from "@/components/activity/ActivitySection";
import NotificationDrawer from "@/components/notifications/NotificationDrawer"; // New component
// import AIChat from "@/components/ai/AIChat"; // Temporarily commented out

/**
 * Main homepage/dashboard of the neighborhood app
 * Reorganized layout with quick actions at top, activity feed below
 * Notifications moved to a slide-out drawer triggered by a button
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

          {/* Notifications Button - Positioned at the top right */}
          <div className="flex justify-end mb-2">
            <NotificationDrawer />
          </div>

          {/* Quick Actions Section - Full width at top */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Quick Actions</h2>
            <QuickActions />
          </section>

          <Separator className="my-2 bg-gray-200" />

          {/* Activity Section - Below Quick Actions */}
          <ActivitySection />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
