
import React, { useState } from 'react';
import { SkillCategory } from './types/skillTypes';
import { useSkillsPreview } from '@/hooks/skills/useSkillsPreview';
import SkillCategoryCard from './SkillCategoryCard';
import CategorySkillsDialog from './CategorySkillsDialog';
import { Loader2 } from 'lucide-react';

/**
 * Grid component that displays all skill categories with previews of available skills
 * Uses a responsive grid layout and handles loading states
 * Now uses the 6 standardized onboarding categories
 */

interface SkillCategoryGridProps {
  onCategoryClick: (category: SkillCategory) => void;
}

const SkillCategoryGrid: React.FC<SkillCategoryGridProps> = ({ onCategoryClick }) => {
  const { data: skillsData, isLoading, error } = useSkillsPreview();
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedEmptyCategory, setSelectedEmptyCategory] = useState<SkillCategory | null>(null);

  // All available skill categories - now using the 6 standardized onboarding categories
  const categories: SkillCategory[] = ['technology', 'emergency', 'professional', 'maintenance', 'care', 'education'];

  // Handle category card click - check if empty
  const handleCategoryCardClick = (category: SkillCategory) => {
    const categoryData = skillsData?.[category];
    const isEmpty = !categoryData || (categoryData.offers.length === 0 && categoryData.requests.length === 0);
    
    if (isEmpty) {
      // Show skills selection dialog for empty categories
      setSelectedEmptyCategory(category);
      setIsCategoryDialogOpen(true);
    } else {
      // Navigate to category view for categories with skills
      onCategoryClick(category);
    }
  };

  // Handle skills selection from the category dialog
  const handleSkillsSelected = async (skills: string[]) => {
    // TODO: Add logic to save the selected skills to the database
    console.log('Selected skills:', skills, 'for category:', selectedEmptyCategory);
    
    // After saving skills, navigate to the category view
    if (selectedEmptyCategory) {
      onCategoryClick(selectedEmptyCategory);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading skill categories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Error loading skill categories. Please try again.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <SkillCategoryCard
            key={category}
            category={category}
            skillsData={skillsData?.[category] || { offers: [], requests: [] }}
            onClick={handleCategoryCardClick}
          />
        ))}
      </div>
      
      {/* Category Skills Selection Dialog */}
      <CategorySkillsDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        category={selectedEmptyCategory || 'technology'}
        onSkillsSelected={handleSkillsSelected}
      />
    </>
  );
};

export default SkillCategoryGrid;
