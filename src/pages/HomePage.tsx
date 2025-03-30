
/**
 * HomePage Component
 * 
 * Main dashboard page that displays:
 * 1. AI Chat interface for interacting with the neighborhood assistant
 * 2. Quick actions for common neighborhood tasks (moved from previous position)
 * 3. Notifications for the current user
 * 
 * Note: The Activity Feed has been removed as requested
 */
import { Separator } from "@/components/ui/separator";
import QuickActions from "@/components/QuickActions";
import NotificationsSection from "@/components/notifications/NotificationsSection";
import AIChat from "@/components/ai/AIChat";

/**
 * Main homepage/dashboard of the neighborhood app
 * Shows AI assistant, quick actions, and notifications
 * Spacing reduced to fit more content on screen
 */
const HomePage = () => {
  return <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-1">
          {/* AI Chat Section - With reduced height */}
          <section>
            <div className="h-[225px]">
              <AIChat />
            </div>
          </section>

          <Separator className="my-2 bg-gray-200" />

          {/* Two Column Layout for Quick Actions and Notifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quick Actions Section - Moved from previous position */}
            <section>
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Quick Actions</h2>
              <QuickActions />
            </section>

            {/* Notifications Section - Remains in the same position */}
            <NotificationsSection />
          </div>
        </div>
      </div>
    </div>;
};
export default HomePage;
