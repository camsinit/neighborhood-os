
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
    <div className="bg-background p-6 space-y-6">
      {/* Header with skills theme accent */}
      <div className="text-center space-y-3">
        <div className="w-12 h-1 mx-auto rounded-full" style={{ backgroundColor: 'hsl(var(--skills-color))' }} />
        <h3 className="text-xl font-semibold text-foreground">Choose a Skill Category</h3>
        <p className="text-muted-foreground">
          Select a category to see available skills you can offer to your neighbors.
        </p>
      </div>

      {/* Category grid with improved styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
        {availableCategories.map((category) => (
          <div
            key={category.key}
            className="group relative p-4 bg-card border border-border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md hover:border-[hsl(var(--skills-color))] hover:bg-[hsl(var(--skills-light))]"
            onClick={() => onCategorySelect(category.key)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-1">
                <h4 className="font-medium text-card-foreground group-hover:text-[hsl(var(--skills-color))] transition-colors">
                  {category.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[hsl(var(--skills-color))] transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* Session summary with skills theme */}
      {selectedSkillsCount > 0 && (
        <div className="border-t border-border pt-4">
          <div className="text-center">
            <div 
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
              style={{ 
                backgroundColor: 'hsl(var(--skills-light))', 
                color: 'hsl(var(--skills-color))' 
              }}
            >
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: 'hsl(var(--skills-color))' }}
              />
              {selectedSkillsCount} skills added this session
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
