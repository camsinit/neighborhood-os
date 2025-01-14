import QuickActions from "@/components/QuickActions";
import CommunityCalendar from "@/components/CommunityCalendar";
import MutualSupport from "@/components/MutualSupport";
import SafetyUpdates from "@/components/SafetyUpdates";

const MainContent = () => {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <style>
        {`
          @keyframes highlight {
            0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
            50% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0.1); }
            100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
          }
          .highlight-section {
            animation: highlight 2s ease-in-out;
          }
        `}
      </style>
      <div className="space-y-8">
        <div className="p-6 rounded-lg bg-[#F1F0FB]/40">
          <QuickActions />
        </div>
        <div className="p-6 rounded-lg bg-[#D3E4FD]/40">
          <CommunityCalendar />
        </div>
        <div className="p-6 rounded-lg bg-[#F5F0FF] mutual-support-container">
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