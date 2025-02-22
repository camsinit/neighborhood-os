import SkillsList from "@/components/skills/SkillsList";
import SkillsHeader from "@/components/skills/SkillsHeader";

// Main Skills page component that displays skills exchange functionality
const SkillsPage = () => {
  return (
    // Main container with gradient background
    <div className="min-h-full w-full bg-gradient-to-b from-[#E8F5FF] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Page Header */}
          <h2 className="text-2xl font-bold text-gray-900">Skills Exchange</h2>
          
          {/* Description Box */}
          <div className="bg-white rounded-lg p-4 mt-2 mb-6">
            <p className="text-gray-700 text-sm">
              Share your expertise and learn from others. Connect with neighbors to exchange 
              skills, teach, learn, and grow together as a community.
            </p>
          </div>

          {/* Main Content Container */}
          <div className="bg-white rounded-lg p-6 px-[15px] py-0">
            {/* Skills Header with filter and search */}
            <SkillsHeader />
            
            {/* Skills List showing all skills */}
            <SkillsList />
          </div>
        </div>
      </div>
    </div>
  );
};
export default SkillsPage;