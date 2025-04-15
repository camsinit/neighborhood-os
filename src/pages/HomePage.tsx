
import { Separator } from "@/components/ui/separator";
import QuickActions from "@/components/QuickActions";
import ActivitySection from "@/components/activity/ActivitySection";
// import AIChat from "@/components/ai/AIChat"; // Temporarily commented out

/**
 * Main homepage/dashboard of the neighborhood app
 * Reorganized layout with quick actions at top, activity feed below
 * Notifications now only shown in Activity section heading
 */
const HomePage = () => {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Quick Actions Section - Notifications moved to Activity section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
            </div>
            <QuickActions />
          </section>

          <Separator className="my-2 bg-gray-200" />

          {/* Activity Section - Contains notifications */}
          <ActivitySection />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
