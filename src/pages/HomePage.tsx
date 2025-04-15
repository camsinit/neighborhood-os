
import { Separator } from "@/components/ui/separator";
import QuickActions from "@/components/QuickActions";
import ActivitySection from "@/components/activity/ActivitySection";
// import AIChat from "@/components/ai/AIChat"; // Temporarily commented out

/**
 * Main homepage/dashboard of the neighborhood app
 * Reorganized layout with quick actions at top, activity feed below
 * Notifications now inline with Activity section heading
 */
const HomePage = () => {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
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
