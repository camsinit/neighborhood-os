
import SafetyUpdates from "@/components/SafetyUpdates";

const SafetyPage = () => {
  return (
    <div className="min-h-full w-full bg-gradient-to-b from-[#FDE1D3] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Page Title */}
          <h2 className="text-2xl font-bold text-gray-900">Safety Updates</h2>
          
          {/* Description Box */}
          <div className="bg-white rounded-lg p-4 mt-2 mb-6">
            <p className="text-gray-700 text-sm">
              Stay informed about safety matters in your community. Share updates, receive alerts, 
              and work together to maintain a secure neighborhood environment.
            </p>
          </div>

          {/* Safety Updates Component */}
          <div className="bg-white rounded-lg p-6">
            <SafetyUpdates />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyPage;
