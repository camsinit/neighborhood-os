
import { useState, useEffect } from "react";
import { Activity } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import QuickActions from "@/components/QuickActions";
import ActivityFeed from "@/components/activity/ActivityFeed";
import { NotificationsList } from "@/notifications/NotificationsList";
import { WelcomePopover } from "@/components/onboarding/WelcomePopover";

const HomePage = () => {
  // State for controlling the welcome popover visibility
  const [showWelcomePopover, setShowWelcomePopover] = useState(false);

  // Check if we should show the welcome popover on component mount
  useEffect(() => {
    // Check localStorage flag set by onboarding completion
    const shouldShowWelcome = localStorage.getItem('showWelcomePopover');
    if (shouldShowWelcome === 'true') {
      console.log("[HomePage] Showing welcome popover from onboarding completion");
      setShowWelcomePopover(true);
      // Clear the flag so it doesn't show again on subsequent visits
      localStorage.removeItem('showWelcomePopover');
    }
  }, []);

  // Handle dismissing the welcome popover
  const handleDismissWelcome = () => {
    console.log("[HomePage] Dismissing welcome popover");
    setShowWelcomePopover(false);
  };

  return (
    <>
      {/* Main dashboard content */}
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

      {/* Welcome popover overlay - appears on top of dashboard after onboarding */}
      <WelcomePopover 
        isVisible={showWelcomePopover} 
        onDismiss={handleDismissWelcome} 
      />
    </>
  );
};

export default HomePage;
