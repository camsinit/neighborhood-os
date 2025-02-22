
import { useState } from "react";
import SkillsList from "@/components/skills/SkillsList";
import SkillsHeader from "@/components/skills/SkillsHeader";
import CategoryView from "@/components/skills/CategoryView";
import { SkillCategory } from "@/components/skills/types/skillTypes";

// Main Skills page component that displays skills exchange functionality
const SkillsPage = () => {
  // State to track whether we're showing categories or list view
  const [showCategories, setShowCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  const [showUserRequests, setShowUserRequests] = useState(false);

  // Handle category selection
  const handleCategoryClick = (category: SkillCategory) => {
    setSelectedCategory(category);
    setShowCategories(false);
    setShowUserRequests(false);
  };

  // Handle viewing user's requests
  const handleViewUserRequests = () => {
    setShowUserRequests(true);
    setShowCategories(false);
  };

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
          <div className="bg-white rounded-lg p-6">
            {/* Skills Header with filter and search */}
            <SkillsHeader 
              showCategories={showCategories}
              onViewChange={() => {
                setShowCategories(!showCategories);
                setShowUserRequests(false);
              }}
              onViewUserRequests={handleViewUserRequests}
            />
            
            {/* Conditional rendering based on view state */}
            {showCategories ? (
              <CategoryView onCategoryClick={handleCategoryClick} />
            ) : (
              <SkillsList 
                selectedCategory={selectedCategory} 
                showUserRequestsOnly={showUserRequests}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsPage;
