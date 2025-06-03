
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import SkillCategoryView from '@/components/skills/SkillCategoryView';
import SkillsList from '@/components/skills/SkillsList';
import { SkillCategory } from '@/components/skills/types/skillTypes';

/**
 * CategorySkillsView - Displays skills within a specific category
 * 
 * This component shows the skills list for a selected category with
 * navigation controls and the ability to add new skills.
 */
interface CategorySkillsViewProps {
  category: string;
  getTypedCategory: (categoryString: string | null) => SkillCategory | undefined;
  handleBackToCategories: () => void;
  setIsSkillDialogOpen: (open: boolean) => void;
}

const CategorySkillsView: React.FC<CategorySkillsViewProps> = ({
  category,
  getTypedCategory,
  handleBackToCategories,
  setIsSkillDialogOpen
}) => {
  // Helper function to format category name for display
  const getCategoryDisplayName = (categoryName: SkillCategory) => {
    return categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  };

  const typedCategory = getTypedCategory(category);
  
  if (!typedCategory) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with back button, title, and add skill button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleBackToCategories}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Button>
          <h2 className="text-xl font-semibold text-gray-900">
            {getCategoryDisplayName(typedCategory)} Skills
          </h2>
        </div>
        
        <Button 
          className="whitespace-nowrap flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white shrink-0"
          onClick={() => setIsSkillDialogOpen(true)}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Skill</span>
        </Button>
      </div>
      
      {/* Use SkillsList in list format instead of the grid-based SkillCategoryView */}
      <SkillsList
        showRequests={false}
        selectedCategory={typedCategory}
        searchQuery=""
      />
    </div>
  );
};

export default CategorySkillsView;
