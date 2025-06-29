import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { SkillCategory } from '@/components/skills/types/skillTypes';
import SkillsPageSelector from './SkillsPageSelector';
import { useQueryClient } from '@tanstack/react-query';
import { unifiedEvents } from '@/utils/unifiedEventSystem';

/**
 * AddSkillPopover - Unified popover for adding skills across the application
 * 
 * This component provides a consistent interface for adding skills from anywhere
 * in the app. It automatically handles different contexts:
 * 
 * 1. Category-specific: When opened from a category view, shows skills for that category
 * 2. General: When opened from main view, shows category selection first
 * 
 * All skill additions are handled by the SkillsPageSelector component.
 * Enhanced with immediate UI refresh when skills are added.
 */
interface AddSkillPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory?: SkillCategory; // If provided, opens directly to that category
  onSkillAdded?: () => void; // Optional callback when skills are added
}

const AddSkillPopover: React.FC<AddSkillPopoverProps> = ({
  open,
  onOpenChange,
  selectedCategory,
  onSkillAdded
}) => {
  // Get query client for manual cache invalidation
  const queryClient = useQueryClient();

  // Handle skill addition success with enhanced refresh
  const handleSkillAdded = () => {
    // Immediately invalidate all skills-related queries to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
    queryClient.invalidateQueries({ queryKey: ['category-skills-list'] });
    queryClient.invalidateQueries({ queryKey: ['simplified-skills'] });
    queryClient.invalidateQueries({ queryKey: ['activities'] });
    
    // Dispatch refresh events for any components listening
    unifiedEvents.emitMultiple(['skills', 'activities']);
    
    // Call optional callback
    if (onSkillAdded) {
      onSkillAdded();
    }
    // Keep popover open so users can add more skills if they want
    // They can close it manually when done
  };

  // Handle submit button click - closes the dialog and ensures final refresh
  const handleSubmit = () => {
    // Perform a final comprehensive refresh before closing
    queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
    queryClient.invalidateQueries({ queryKey: ['category-skills-list'] });
    queryClient.invalidateQueries({ queryKey: ['simplified-skills'] });
    queryClient.invalidateQueries({ queryKey: ['activities'] });
    
    // Dispatch refresh events
    unifiedEvents.emitMultiple(['skills', 'activities']);
    
    // Close the dialog when user clicks Submit
    onOpenChange(false);
    
    // Call the onSkillAdded callback to refresh any parent components
    if (onSkillAdded) {
      onSkillAdded();
    }
  };

  // Determine title based on context
  const getTitle = () => {
    if (selectedCategory) {
      // Get the category display name from SKILL_CATEGORIES if needed
      return `Add ${selectedCategory} Skills`;
    }
    return 'Add Skills to Share';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-2xl max-h-[80vh] overflow-y-auto" 
        hideCloseButton={true}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle>{getTitle()}</DialogTitle>
          
          {/* Custom Submit button in top right */}
          <Button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            size="sm"
          >
            <Check className="h-4 w-4" />
            Submit
          </Button>
        </DialogHeader>
        
        {/* Use the enhanced SkillsPageSelector */}
        <SkillsPageSelector 
          selectedCategory={selectedCategory} 
          onSkillAdded={handleSkillAdded} 
          multiCategoryMode={!selectedCategory} // Enable multi-category mode when no specific category
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddSkillPopover;
