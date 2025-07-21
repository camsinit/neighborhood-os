
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { SkillCategory } from '@/components/skills/types/skillTypes';

/**
 * Header component for the skills page selector
 * Shows the category title and back button for multi-category mode
 */
interface SkillsPageHeaderProps {
  categoryTitle: string;
  multiCategoryMode: boolean;
  onBackToCategories: () => void;
}

const SkillsPageHeader: React.FC<SkillsPageHeaderProps> = ({
  categoryTitle,
  multiCategoryMode,
  onBackToCategories
}) => {
  return (
    <div className="bg-background p-6 space-y-4">
      {/* Back button for multi-category mode */}
      {multiCategoryMode && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToCategories}
          className="text-[hsl(var(--skills-color))] hover:bg-[hsl(var(--skills-light))] hover:text-[hsl(var(--skills-color))]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>
      )}
      
      {/* Header with skills theme accent */}
      <div className="text-center space-y-3">
        <div className="w-12 h-1 mx-auto rounded-full" style={{ backgroundColor: 'hsl(var(--skills-color))' }} />
        <h3 className="text-xl font-semibold text-foreground">Add {categoryTitle} Skills</h3>
        <p className="text-muted-foreground">
          Select skills you can offer to your neighbors. Skills will be added immediately when selected.
        </p>
      </div>
    </div>
  );
};

export default SkillsPageHeader;
