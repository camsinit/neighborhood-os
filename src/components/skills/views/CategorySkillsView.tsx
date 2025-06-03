
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { SkillCategory } from '@/components/skills/types/skillTypes';
import SimplifiedSkillsList from '@/components/skills/SimplifiedSkillsList';

interface CategorySkillsViewProps {
  category: string | null;
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
  const typedCategory = getTypedCategory(category);

  if (!typedCategory) {
    return <div>No category selected.</div>;
  }

  const handleAddSkill = () => {
    setIsSkillDialogOpen(true);
  };

  return (
    <div>
      <Button variant="ghost" onClick={handleBackToCategories} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Categories
      </Button>
      <h2 className="text-2xl font-bold mb-4">{typedCategory} Skills</h2>
      <SimplifiedSkillsList
        showRequests={false}
        selectedCategory={typedCategory}
        searchQuery=""
      />
    </div>
  );
};

export default CategorySkillsView;
