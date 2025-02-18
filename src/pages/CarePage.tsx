
import MutualSupport from "@/components/MutualSupport";
import { ViewType } from "@/components/mutual-support/types";

const CarePage = () => {
  return (
    <div className="min-h-full w-full bg-gradient-to-b from-[#FFDEE2] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Page Title */}
          <h2 className="text-2xl font-bold text-gray-900">Care Support</h2>
          
          {/* Description Box */}
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 mt-2 mb-6">
            <p className="text-gray-700 text-sm">
              Connect with neighbors for mutual care and support. Whether offering or seeking 
              assistance, build a stronger community through compassionate connections.
            </p>
          </div>

          {/* Care Support Component */}
          <MutualSupport view="care" />
        </div>
      </div>
    </div>
  );
};

export default CarePage;
