
import { useState } from "react";
import { UserDirectory } from "@/components/neighbors/UserDirectory";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const NeighborsPage = () => {
  // Add state for search query
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-[#D3E4FD] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Page Title */}
          <h2 className="text-2xl font-bold text-gray-900">My Neighbors</h2>
          
          {/* Description Box */}
          <div className="bg-white rounded-lg p-4 mt-2 mb-6">
            <p className="text-gray-700 text-sm">
              Meet and connect with your neighbors. Browse profiles, discover shared interests, 
              and build meaningful connections within your community.
            </p>
          </div>

          {/* Main Content Container */}
          <div className="bg-white rounded-lg p-6">
            {/* Search Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="relative w-[280px]">
                <Input
                  type="text"
                  placeholder="Search neighbors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* User Directory Component */}
            <UserDirectory searchQuery={searchQuery} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeighborsPage;
