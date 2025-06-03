
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { SKILL_CATEGORIES } from '@/components/onboarding/survey/steps/skills/skillCategories';
import { SkillCategory } from '@/components/skills/types/skillTypes';

/**
 * CategorySelector - Component for selecting skill categories
 * Used in multi-category mode to let users choose which category of skills to add
 */
interface CategorySelectorProps {
  onCategorySelect: (category: SkillCategory) => void;
  selectedSkillsCount: number;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  onCategorySelect,
  selectedSkillsCount
}) => {
  // Get available categories for multi-category mode
  const availableCategories = Object.entries(SKILL_CATEGORIES).map(([key, value]) => ({
    key: key as SkillCategory,
    title: value.title,
    description: `${value.title} related skills` // Simple description since original doesn't have one
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Choose a Skill Category</h3>
        <p className="text-sm text-muted-foreground">
          Select a category to see available skills you can offer to your neighbors.
        </p>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
        {availableCategories.map((category) => (
          <div
            key={category.key}
            className="p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 hover:border-green-500"
            onClick={() => onCategorySelect(category.key)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{category.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {category.description}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Session summary */}
      {selectedSkillsCount > 0 && (
        <div className="space-y-2 border-t pt-4">
          <div className="text-center">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-secondary text-secondary-foreground">
              {selectedSkillsCount} skills added this session
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
