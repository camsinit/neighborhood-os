
import MutualSupport from "@/components/MutualSupport";

const SkillsPage = () => {
  return (
    <div className="min-h-full w-full bg-gradient-to-b from-[#E8F5FF] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Page Title */}
          <h2 className="text-2xl font-bold text-gray-900">Skills Exchange</h2>
          
          {/* Description Box */}
          <div className="bg-white rounded-lg p-4 mt-2 mb-6">
            <p className="text-gray-700 text-sm">
              Share your expertise and learn from others. Connect with neighbors to exchange 
              skills, teach, learn, and grow together as a community.
            </p>
          </div>

          {/* Main Content Container */}
          <div className="bg-white rounded-lg p-6">
            <MutualSupport view="skills" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsPage;
