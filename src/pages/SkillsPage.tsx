
import { useState } from "react";
import SkillsList from "@/components/skills/SkillsList";
import SkillsHeader from "@/components/skills/SkillsHeader";
import CategoryView from "@/components/skills/CategoryView";
import { SkillCategory } from "@/components/skills/types/skillTypes";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const SkillsPage = () => {
  const [showCategories, setShowCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);

  const handleCategoryClick = (category: SkillCategory) => {
    setSelectedCategory(category);
    setShowCategories(false);
  };

  const handleBackToCategories = () => {
    setShowCategories(true);
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-[#E8F5FF] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h2 className="text-2xl font-bold text-gray-900">Skills Exchange</h2>
          
          <div className="bg-white rounded-lg p-4 mt-2 mb-6 shadow-md">
            <p className="text-gray-700 text-sm">
              Share your expertise and learn from others. Connect with neighbors to exchange 
              skills, teach, learn, and grow together as a community.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <SkillsHeader 
              showCategories={showCategories}
              onViewChange={() => {
                setShowCategories(!showCategories);
                setSelectedCategory(null);
              }}
            />
            
            <div className="flex items-center gap-2 mb-6">
              {!showCategories && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToCategories}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <h3 className="text-lg font-semibold text-gray-900">
                {showCategories ? 'Categories' : (selectedCategory || 'All Skills')}
              </h3>
            </div>
            
            {showCategories ? (
              <CategoryView onCategoryClick={handleCategoryClick} />
            ) : (
              <SkillsList 
                selectedCategory={selectedCategory}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsPage;
