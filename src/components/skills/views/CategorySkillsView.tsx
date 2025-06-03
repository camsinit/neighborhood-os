
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { SkillCategory } from '../types/skillTypes';
import CategorySkillsList from './CategorySkillsList';
import { SKILL_CATEGORIES } from '@/components/onboarding/survey/steps/skills/skillCategories';

/**
 * CategorySkillsView - Component that displays skills within a specific category
 * 
 * This component shows:
 * - A header with back button, category title, and add skill button
 * - The CategorySkillsList component which handles all the skill display logic
 */
interface CategorySkillsViewProps {
  category: SkillCategory;
  onBack: () => void;
  onAddSkill: () => void; // Add skill callback
}

const CategorySkillsView: React.FC<CategorySkillsViewProps> = ({ 
  category, 
  onBack,
  onAddSkill 
}) => {
  // Get the category display title
  const categoryTitle = SKILL_CATEGORIES[category]?.title || category;

  return (
    <div className="space-y-6">
      {/* Header with back button, title, and add skill button */}
      <div className="flex items-center justify-between">
        {/* Back button */}
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Button>
        
        {/* Category title */}
        <h2 className="text-2xl font-bold">{categoryTitle} Skills</h2>
        
        {/* Add skill button */}
        <Button 
          onClick={onAddSkill}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Skill
        </Button>
      </div>

      {/* Skills list - this component handles all the edit/delete functionality */}
      <CategorySkillsList selectedCategory={category} />
    </div>
  );
};

export default CategorySkillsView;
