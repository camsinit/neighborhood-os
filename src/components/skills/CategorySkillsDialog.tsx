
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { SkillCategory } from './types/skillTypes';
import { SKILL_CATEGORIES } from '@/components/onboarding/survey/steps/skills/skillCategories';

/**
 * Dialog that shows available skills for a specific category
 * Allows users to select which skills they want to add when a category is empty
 * ENHANCED: Now supports loading state during skill submission
 */

interface CategorySkillsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: SkillCategory;
  onSkillsSelected: (skills: string[]) => void;
  isSubmitting?: boolean; // New prop to show loading state
}

const CategorySkillsDialog: React.FC<CategorySkillsDialogProps> = ({
  open,
  onOpenChange,
  category,
  onSkillsSelected,
  isSubmitting = false
}) => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  // Get skills for the current category from the onboarding data
  const categorySkills = SKILL_CATEGORIES[category]?.skills || [];
  const categoryTitle = SKILL_CATEGORIES[category]?.title || category;
  
  // Handle skill selection toggle
  const handleSkillToggle = (skill: string, checked: boolean) => {
    if (checked) {
      setSelectedSkills(prev => [...prev, skill]);
    } else {
      setSelectedSkills(prev => prev.filter(s => s !== skill));
    }
  };
  
  // Handle form submission
  const handleSubmit = () => {
    onSkillsSelected(selectedSkills);
    // Don't reset state immediately - let parent handle it after successful submission
  };
  
  // Handle dialog close
  const handleClose = () => {
    if (!isSubmitting) { // Prevent closing while submitting
      setSelectedSkills([]);
      onOpenChange(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Add {categoryTitle} Skills
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Select the skills you have in this category that you'd like to share with neighbors.
          </p>
        </DialogHeader>
        
        {/* Scrollable skills list */}
        <div className="flex-1 overflow-y-auto space-y-3 py-4">
          {categorySkills.map((skill) => (
            <div key={skill} className="flex items-center space-x-2">
              <Checkbox
                id={skill}
                checked={selectedSkills.includes(skill)}
                onCheckedChange={(checked) => handleSkillToggle(skill, checked as boolean)}
                disabled={isSubmitting} // Disable during submission
              />
              <Label 
                htmlFor={skill} 
                className={`text-sm cursor-pointer flex-1 ${isSubmitting ? 'opacity-50' : ''}`}
              >
                {skill}
              </Label>
            </div>
          ))}
        </div>
        
        {/* Action buttons with loading state */}
        <div className="flex gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="flex-1"
            disabled={isSubmitting} // Disable during submission
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={selectedSkills.length === 0 || isSubmitting}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Adding...
              </>
            ) : (
              `Add ${selectedSkills.length} Skill${selectedSkills.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategorySkillsDialog;
