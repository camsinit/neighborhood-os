
import MutualSupport from "@/components/MutualSupport";
import { ViewType } from "@/components/mutual-support/types";

const GoodsPage = () => {
  return (
    <div className="min-h-full w-full bg-gradient-to-b from-[#FEC6A1] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Page Title */}
          <h2 className="text-2xl font-bold text-gray-900">Goods Exchange</h2>
          
          {/* Description Box */}
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 mt-2 mb-6">
            <p className="text-gray-700 text-sm">
              Share and request items within your community. From tools to furniture, 
              connect with neighbors to give, receive, or borrow what you need.
            </p>
          </div>

          {/* Goods Exchange Component */}
          <MutualSupport view="goods" />
        </div>
      </div>
    </div>
  );
};

export default GoodsPage;
