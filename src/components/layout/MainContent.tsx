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
        <div className="p-6 rounded-lg bg-white border border-gray-200">
          <QuickActions />
        </div>
        <div className="p-6 rounded-lg bg-white shadow-[0_4px_12px_#D3E4FD] border border-blue-300">
          <CommunityCalendar />
        </div>
        <div className="p-6 rounded-lg bg-white shadow-[0_4px_12px_#9b87f5] mutual-support-container border border-[#9b87f5]">
          <MutualSupport />
        </div>
        <div className="p-6 rounded-lg bg-white shadow-[0_4px_12px_#ef4444] border border-red-300">
          <SafetyUpdates />
        </div>
      </div>
    </main>
  );
};

export default MainContent;