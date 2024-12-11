import QuickActions from "@/components/QuickActions";
import CommunityCalendar from "@/components/CommunityCalendar";
import MutualSupport from "@/components/MutualSupport";
import SafetyUpdates from "@/components/SafetyUpdates";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-primary">NeighBoard</div>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-sm text-gray-600">Sign In</button>
              <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm">Sign Up</button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="p-6 rounded-lg bg-[#f3f3f3]">
            <QuickActions />
          </div>
          <div className="p-6 rounded-lg bg-[#f3f3f3]">
            <CommunityCalendar />
          </div>
          <div className="p-6 rounded-lg bg-[#f3f3f3]">
            <MutualSupport />
          </div>
          <div className="p-6 rounded-lg bg-[#f3f3f3]">
            <SafetyUpdates />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;