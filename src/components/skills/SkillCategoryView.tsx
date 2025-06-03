
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { SkillCategory } from './types/skillTypes';
import SimplifiedSkillsList from './SimplifiedSkillsList';

/**
 * Component that displays all skills within a specific category
 * Includes a back button to return to the category grid
 */

interface SkillCategoryViewProps {
  category: SkillCategory;
  onBack: () => void;
}

const SkillCategoryView: React.FC<SkillCategoryViewProps> = ({ category, onBack }) => {
  // Format category name for display
  const categoryDisplayName = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="space-y-4">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Button>
        <h2 className="text-xl font-semibold text-gray-900">
          {categoryDisplayName} Skills
        </h2>
      </div>

      {/* Skills list filtered by category */}
      <SimplifiedSkillsList
        showRequests={false}
        selectedCategory={category}
        searchQuery=""
      />
    </div>
  );
};

export default SkillCategoryView;
