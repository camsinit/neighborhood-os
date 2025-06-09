
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
    <div className="space-y-2">
      {/* Back button for multi-category mode */}
      {multiCategoryMode && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToCategories}
          className="mb-2 text-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Categories
        </Button>
      )}
      
      {/* Header text */}
      <div className="text-center">
        <h3 className="text-lg font-semibold">Add {categoryTitle} Skills</h3>
        <p className="text-sm text-muted-foreground">
          Select skills you can offer to your neighbors. Skills will be added immediately when selected.
        </p>
      </div>
    </div>
  );
};

export default SkillsPageHeader;
