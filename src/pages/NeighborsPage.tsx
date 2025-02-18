
import { UserDirectory } from "@/components/neighbors/UserDirectory";

const NeighborsPage = () => {
  return (
    <div className="min-h-full w-full bg-gradient-to-b from-[#D3E4FD] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Page Title */}
          <h2 className="text-2xl font-bold text-gray-900">My Neighbors</h2>
          
          {/* Description Box */}
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 mt-2 mb-6">
            <p className="text-gray-700 text-sm">
              Meet and connect with your neighbors. Browse profiles, discover shared interests, 
              and build meaningful connections within your community.
            </p>
          </div>

          {/* Neighbors Directory Component */}
          <UserDirectory />
        </div>
      </div>
    </div>
  );
};

export default NeighborsPage;
