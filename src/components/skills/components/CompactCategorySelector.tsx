import React, { useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SKILL_CATEGORIES } from '@/components/onboarding/survey/steps/skills/skillCategories';
import { SkillCategory } from '@/components/skills/types/skillTypes';

/**
 * CompactCategorySelector - Redesigned category selector optimized for side panels
 * Features: single-column layout, search functionality, better visual hierarchy
 * Designed for mobile-first side panel experience (400px-540px width)
 */
interface CompactCategorySelectorProps {
  onCategorySelect: (category: SkillCategory) => void;
  selectedSkillsCount: number;
}

const CompactCategorySelector: React.FC<CompactCategorySelectorProps> = ({
  onCategorySelect,
  selectedSkillsCount
}) => {
  // Search state for category filtering
  const [searchQuery, setSearchQuery] = useState('');

  // Get available categories and filter by search query
  const availableCategories = Object.entries(SKILL_CATEGORIES)
    .map(([key, value]) => ({
      key: key as SkillCategory,
      title: value.title,
      skillCount: value.skills.length,
      description: `${value.skills.length} skills available`
    }))
    .filter(category => 
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      searchQuery === ''
    );

  return (
    <div className="space-y-6 p-6">
      {/* Header with skills theme accent - optimized for side panels */}
      <div className="text-center space-y-3">
        <div className="w-12 h-1 mx-auto rounded-full bg-skills" />
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-foreground">Choose a Skill Category</h3>
          <p className="text-sm text-muted-foreground">
            Select a category to see skills you can offer to your neighbors.
          </p>
        </div>
      </div>

      {/* Search input - helps with navigation in side panels */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Single-column category list - optimized for side panel width */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {availableCategories.map((category) => (
          <div
            key={category.key}
            className="group relative flex items-center justify-between p-4 bg-card border border-border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm hover:border-skills hover:bg-skills-light"
            onClick={() => onCategorySelect(category.key)}
          >
            {/* Category info - optimized layout for lists */}
            <div className="flex-1 space-y-1">
              <h4 className="font-medium text-card-foreground group-hover:text-skills transition-colors">
                {category.title}
              </h4>
              <p className="text-xs text-muted-foreground">
                {category.description}
              </p>
            </div>
            
            {/* Arrow indicator with skills theme */}
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-skills transition-colors flex-shrink-0 ml-3" />
          </div>
        ))}
        
        {/* No results message */}
        {availableCategories.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No categories found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Session summary with skills theme - sticky at bottom */}
      {selectedSkillsCount > 0 && (
        <div className="border-t border-border pt-4 mt-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors bg-skills-light text-skills">
              <div className="w-2 h-2 rounded-full animate-pulse bg-skills" />
              {selectedSkillsCount} skills added this session
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactCategorySelector;