import QuickActions from "@/components/QuickActions";
import CommunityCalendar from "@/components/CommunityCalendar";
import MutualSupport from "@/components/MutualSupport";
import SafetyUpdates from "@/components/SafetyUpdates";
import { Button } from "@/components/ui/button";
import { seedDashboard } from "@/utils/seedDashboard";
import { toast } from "sonner";

const MainContent = () => {
  const handleSeed = async () => {
    try {
      await seedDashboard();
      toast.success("Dashboard populated with demo content!");
      // Force reload to show new content
      window.location.reload();
    } catch (error) {
      console.error('Error seeding dashboard:', error);
      toast.error("Failed to populate dashboard");
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <Button 
          onClick={handleSeed}
          className="mb-4 bg-purple-500 hover:bg-purple-600"
        >
          Populate Dashboard with Demo Content
        </Button>
        <div className="p-6 rounded-lg bg-[#F1F0FB]/40">
          <QuickActions />
        </div>
        <div className="p-6 rounded-lg bg-[#D3E4FD]/40">
          <CommunityCalendar />
        </div>
        <div className="p-6 rounded-lg bg-[#F5F0FF]">
          <MutualSupport />
        </div>
        <div className="p-6 rounded-lg bg-[#FDE1D3]/40">
          <SafetyUpdates />
        </div>
      </div>
    </main>
  );
};

export default MainContent;