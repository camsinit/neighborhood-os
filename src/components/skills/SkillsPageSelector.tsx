
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SKILL_CATEGORIES, SPECIAL_SKILLS } from '@/components/onboarding/survey/steps/skills/skillCategories';
import { SkillCategory } from '@/components/skills/types/skillTypes';
import { useSkillsExchange } from '@/hooks/skills/useSkillsExchange';
import { toast } from 'sonner';
import CategorySelector from './components/CategorySelector';
import SkillGrid from './components/SkillGrid';
import CustomSkillInput from './components/CustomSkillInput';
import SelectedSkillsDisplay from './components/SelectedSkillsDisplay';

/**
 * Enhanced SkillsPageSelector - Now supports both single and multi-category modes
 * 
 * This component provides a guided skill selection experience that can work in:
 * 1. Single category mode (when opened from a specific category view)
 * 2. Multi-category mode (when opened from the main skills page)
 * 
 * FIXED: Skills are now properly submitted to database when selected
 */
interface SkillsPageSelectorProps {
  selectedCategory?: SkillCategory; // Optional - if provided, single category mode
  onSkillAdded: () => void; // Callback when a skill is successfully added
  multiCategoryMode?: boolean; // Enable category selection first
}

interface SelectedSkill {
  name: string;
  details?: string;
  category: SkillCategory;
}

const SkillsPageSelector: React.FC<SkillsPageSelectorProps> = ({
  selectedCategory,
  onSkillAdded,
  multiCategoryMode = false
}) => {
  // Track selected skills for this session (for UI feedback only)
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);
  
  // Multi-category mode state
  const [currentCategory, setCurrentCategory] = useState<SkillCategory | null>(
    selectedCategory || null
  );
  const [showCategorySelection, setShowCategorySelection] = useState(
    multiCategoryMode && !selectedCategory
  );
  
  // Special skill dialog state
  const [specialSkillDialog, setSpecialSkillDialog] = useState<{
    isOpen: boolean;
    skillName: string;
    details: string;
  }>({
    isOpen: false,
    skillName: '',
    details: ''
  });

  // Hook for submitting skills to database
  const { handleSubmit } = useSkillsExchange({
    onSuccess: () => {
      console.log('Skill successfully added to database');
      onSkillAdded(); // Notify parent component
    }
  });

  // Get skills for the current category
  const categorySkills = currentCategory ? SKILL_CATEGORIES[currentCategory]?.skills || [] : [];
  const categoryTitle = currentCategory ? SKILL_CATEGORIES[currentCategory]?.title || currentCategory : '';

  /**
   * Handle category selection in multi-category mode
   */
  const handleCategorySelect = (category: SkillCategory) => {
    setCurrentCategory(category);
    setShowCategorySelection(false);
  };

  /**
   * Go back to category selection
   */
  const handleBackToCategories = () => {
    setCurrentCategory(null);
    setShowCategorySelection(true);
  };

  /**
   * Handle skill selection toggle - FIXED to properly submit to database
   */
  const handleSkillSelect = async (skillName: string) => {
    if (!currentCategory) return;
    
    const isSelected = selectedSkills.some(skill => 
      skill.name === skillName && skill.category === currentCategory
    );
    
    if (isSelected) {
      // Remove skill from local UI selection (Note: this doesn't delete from database)
      setSelectedSkills(prev => prev.filter(skill => 
        !(skill.name === skillName && skill.category === currentCategory)
      ));
      return;
    }

    // Check if this skill requires additional details
    if (SPECIAL_SKILLS[skillName as keyof typeof SPECIAL_SKILLS]) {
      setSpecialSkillDialog({
        isOpen: true,
        skillName,
        details: ''
      });
    } else {
      // Submit skill immediately to database
      try {
        console.log('Submitting skill to database:', { skillName, category: currentCategory });
        
        await handleSubmit({
          title: skillName,
          category: currentCategory,
          description: `${skillName} skill in ${currentCategory}`
        }, 'offer');
        
        // Add to local selection for UI feedback
        setSelectedSkills(prev => [...prev, { 
          name: skillName, 
          category: currentCategory 
        }]);
        
        toast.success(`${skillName} skill added successfully!`);
      } catch (error) {
        console.error('Error adding skill:', error);
        toast.error('Failed to add skill. Please try again.');
      }
    }
  };

  /**
   * Handle special skill dialog confirmation - FIXED to properly submit
   */
  const handleSpecialSkillConfirm = async () => {
    if (specialSkillDialog.skillName && specialSkillDialog.details.trim() && currentCategory) {
      try {
        console.log('Submitting special skill to database:', { 
          skillName: specialSkillDialog.skillName, 
          details: specialSkillDialog.details,
          category: currentCategory 
        });
        
        await handleSubmit({
          title: specialSkillDialog.skillName,
          category: currentCategory,
          description: specialSkillDialog.details.trim()
        }, 'offer');
        
        // Add to local selection for UI feedback
        setSelectedSkills(prev => [...prev, { 
          name: specialSkillDialog.skillName, 
          details: specialSkillDialog.details.trim(),
          category: currentCategory
        }]);
        
        toast.success(`${specialSkillDialog.skillName} skill added successfully!`);
      } catch (error) {
        console.error('Error adding special skill:', error);
        toast.error('Failed to add skill. Please try again.');
      }
    }
    setSpecialSkillDialog({ isOpen: false, skillName: '', details: '' });
  };

  /**
   * Handle custom skill addition - FIXED to properly submit
   */
  const handleCustomSkillAdd = async (skillName: string) => {
    if (currentCategory && skillName.trim()) {
      try {
        console.log('Submitting custom skill to database:', { skillName, category: currentCategory });
        
        await handleSubmit({
          title: skillName.trim(),
          category: currentCategory,
          description: `Custom ${skillName.trim()} skill in ${currentCategory}`
        }, 'offer');
        
        // Add to local selection for UI feedback
        setSelectedSkills(prev => [...prev, { 
          name: skillName.trim(),
          category: currentCategory
        }]);
        
        toast.success(`${skillName.trim()} skill added successfully!`);
      } catch (error) {
        console.error('Error adding custom skill:', error);
        toast.error('Failed to add custom skill. Please try again.');
      }
    }
  };

  /**
   * Remove a skill from local selection (visual feedback only - doesn't delete from database)
   */
  const removeSkill = (skillName: string, category: SkillCategory) => {
    setSelectedSkills(prev => prev.filter(skill => 
      !(skill.name === skillName && skill.category === category)
    ));
  };

  /**
   * Get selected skill names for current category (for UI display)
   */
  const getSelectedSkillNames = () => {
    return selectedSkills
      .filter(skill => skill.category === currentCategory)
      .map(skill => skill.name);
  };

  // Render category selection view
  if (showCategorySelection) {
    return (
      <>
        <CategorySelector
          onCategorySelect={handleCategorySelect}
          selectedSkillsCount={selectedSkills.length}
        />
        
        {/* Multi-category selected skills display */}
        <SelectedSkillsDisplay
          selectedSkills={selectedSkills}
          onRemoveSkill={removeSkill}
          showMultiCategory={true}
        />
      </>
    );
  }

  // Render skill selection view
  return (
    <div className="space-y-6">
      {/* Header with back button for multi-category mode */}
      <div className="space-y-2">
        {multiCategoryMode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToCategories}
            className="mb-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Categories
          </Button>
        )}
        <div className="text-center">
          <h3 className="text-lg font-semibold">Add {categoryTitle} Skills</h3>
          <p className="text-sm text-muted-foreground">
            Select skills you can offer to your neighbors. Skills will be added immediately when selected.
          </p>
        </div>
      </div>

      {/* Selected skills display */}
      <SelectedSkillsDisplay
        selectedSkills={selectedSkills}
        currentCategory={currentCategory}
        onRemoveSkill={removeSkill}
      />

      {/* Skills grid */}
      <SkillGrid
        skills={categorySkills}
        selectedSkills={getSelectedSkillNames()}
        onSkillSelect={handleSkillSelect}
      />

      {/* Custom skill input */}
      <CustomSkillInput
        categoryTitle={categoryTitle}
        onAddCustomSkill={handleCustomSkillAdd}
      />

      {/* Special skill details dialog */}
      <Dialog open={specialSkillDialog.isOpen} onOpenChange={(open) => 
        setSpecialSkillDialog(prev => ({ ...prev, isOpen: open }))
      }>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Details for {specialSkillDialog.skillName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">
                {SPECIAL_SKILLS[specialSkillDialog.skillName as keyof typeof SPECIAL_SKILLS]?.prompt}
              </Label>
              <Input
                placeholder={SPECIAL_SKILLS[specialSkillDialog.skillName as keyof typeof SPECIAL_SKILLS]?.placeholder}
                value={specialSkillDialog.details}
                onChange={(e) => setSpecialSkillDialog(prev => ({ ...prev, details: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => 
              setSpecialSkillDialog({ isOpen: false, skillName: '', details: '' })
            }>
              Cancel
            </Button>
            <Button 
              onClick={handleSpecialSkillConfirm}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Add Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SkillsPageSelector;
