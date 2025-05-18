
/**
 * Main homepage/dashboard of the neighborhood app
 * Reorganized layout with quick actions at top, activity feed below
 */
import { Separator } from "@/components/ui/separator";
import QuickActions from "@/components/QuickActions";
import ActivitySection from "@/components/activity/ActivitySection";

const HomePage = () => {
  return <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Quick Actions Section with proper heading */}
          <section>
            <h1 className="font-bold mb-4 text-lg">Quick Actions</h1>
            <QuickActions />
          </section>

          <Separator className="my-2 bg-gray-200" />

          {/* Activity Section */}
          <ActivitySection />
        </div>
      </div>
    </div>;
};

export default HomePage;
