
import React, { useState } from 'react';
import { SkillCategory } from '@/components/skills/types/skillTypes';
import { SKILL_CATEGORIES } from '@/components/onboarding/survey/steps/skills/skillCategories';
import CategorySelector from './components/CategorySelector';
import SkillGrid from './components/SkillGrid';
import CustomSkillInput from './components/CustomSkillInput';
import SelectedSkillsDisplay from './components/SelectedSkillsDisplay';
import SkillsPageHeader from './components/SkillsPageHeader';
import SpecialSkillDialog from './components/SpecialSkillDialog';
import { useSkillSelection } from './hooks/useSkillSelection';
import { toast } from 'sonner';

/**
 * Enhanced SkillsPageSelector - Now supports both single and multi-category modes
 * 
 * This component provides a guided skill selection experience that can work in:
 * 1. Single category mode (when opened from a specific category view)
 * 2. Multi-category mode (when opened from the main skills page)
 * 
 * REFACTORED: Split into smaller, focused components for better maintainability
 */
interface SkillsPageSelectorProps {
  selectedCategory?: SkillCategory; // Optional - if provided, single category mode
  onSkillAdded: () => void; // Callback when a skill is successfully added
  multiCategoryMode?: boolean; // Enable category selection first
}

const SkillsPageSelector: React.FC<SkillsPageSelectorProps> = ({
  selectedCategory,
  onSkillAdded,
  multiCategoryMode = false
}) => {
  // Multi-category mode state
  const [currentCategory, setCurrentCategory] = useState<SkillCategory | null>(
    selectedCategory || null
  );
  const [showCategorySelection, setShowCategorySelection] = useState(
    multiCategoryMode && !selectedCategory
  );

  // Use the skill selection hook for all skill-related logic
  const {
    selectedSkills,
    specialSkillDialog,
    setSpecialSkillDialog,
    handleSkillSelect,
    handleSpecialSkillConfirm,
    handleCustomSkillAdd,
    removeSkill
  } = useSkillSelection({ onSkillAdded });

  // Get skills for the current category
  const categorySkills = currentCategory ? SKILL_CATEGORIES[currentCategory]?.skills || [] : [];
  const categoryTitle = currentCategory ? SKILL_CATEGORIES[currentCategory]?.title || currentCategory : '';

  /**
   * Handle category selection in multi-category mode
   */
  const handleCategorySelect = (category: SkillCategory) => {
    console.log('📂 Category selected:', category);
    setCurrentCategory(category);
    setShowCategorySelection(false);
  };

  /**
   * Go back to category selection
   */
  const handleBackToCategories = () => {
    console.log('⬅️ Going back to category selection');
    setCurrentCategory(null);
    setShowCategorySelection(true);
  };

  /**
   * Get selected skill names for current category (for UI display)
   */
  const getSelectedSkillNames = () => {
    return selectedSkills
      .filter(skill => skill.category === currentCategory)
      .map(skill => skill.name);
  };

  /**
   * FIXED skill selection handler with comprehensive debugging and proper error handling
   */
  const handleSkillSelection = async (skillName: string) => {
    // STEP 1: Log entry point with detailed context
    console.log('🎯 [SkillsPageSelector] handleSkillSelection ENTRY POINT:', {
      skillName,
      currentCategory,
      categoryTitle,
      hasCategory: !!currentCategory,
      timestamp: new Date().toISOString()
    });

    // STEP 2: Early validation - must have category
    if (!currentCategory) {
      console.error('❌ [SkillsPageSelector] VALIDATION FAILED - no current category');
      toast.error('Please select a category first');
      return;
    }

    console.log('✅ [SkillsPageSelector] Validation passed, proceeding with skill selection');

    try {
      // STEP 3: Call the hook's skill select handler with proper await
      console.log('🔄 [SkillsPageSelector] About to call handleSkillSelect with:', {
        skillName,
        currentCategory,
        timestamp: new Date().toISOString()
      });
      
      const result = await handleSkillSelect(skillName, currentCategory);
      
      console.log('✅ [SkillsPageSelector] handleSkillSelect completed:', {
        result,
        skillName,
        currentCategory,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      // STEP 4: Comprehensive error handling
      console.error('❌ [SkillsPageSelector] handleSkillSelect ERROR:', {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        skillName,
        currentCategory,
        timestamp: new Date().toISOString()
      });
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to add skill: ${errorMessage}`);
    }
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
    <div className="bg-white min-h-full">
      {/* Header with back button for multi-category mode */}
      <SkillsPageHeader
        categoryTitle={categoryTitle}
        multiCategoryMode={multiCategoryMode}
        onBackToCategories={handleBackToCategories}
      />

      {/* Content area with proper spacing */}
      <div className="p-6 space-y-6">
        {/* Selected skills display */}
        <SelectedSkillsDisplay
          selectedSkills={selectedSkills}
          currentCategory={currentCategory}
          onRemoveSkill={removeSkill}
        />

        {/* Skills grid - FIXED: Ensure proper handler connection */}
        <SkillGrid
          skills={categorySkills}
          selectedSkills={getSelectedSkillNames()}
          onSkillSelect={handleSkillSelection} // This now has proper debugging and error handling
        />

        {/* Custom skill input */}
        <CustomSkillInput
          categoryTitle={categoryTitle}
          onAddCustomSkill={(skillName) => {
            console.log('🎯 [SkillsPageSelector] Custom skill add requested:', { skillName, currentCategory });
            if (currentCategory) {
              handleCustomSkillAdd(skillName, currentCategory);
            } else {
              console.error('❌ Cannot add custom skill without category');
              toast.error('Please select a category first');
            }
          }}
        />
      </div>

      {/* Special skill details dialog */}
      <SpecialSkillDialog
        isOpen={specialSkillDialog.isOpen}
        skillName={specialSkillDialog.skillName}
        details={specialSkillDialog.details}
        onDetailsChange={(details) => 
          setSpecialSkillDialog(prev => ({ ...prev, details }))
        }
        onConfirm={() => {
          console.log('🎯 [SkillsPageSelector] Special skill confirm requested:', { 
            skillName: specialSkillDialog.skillName, 
            currentCategory 
          });
          if (currentCategory) {
            handleSpecialSkillConfirm(currentCategory);
          } else {
            console.error('❌ Cannot confirm special skill without category');
            toast.error('Please select a category first');
          }
        }}
        onCancel={() => 
          setSpecialSkillDialog({ isOpen: false, skillName: '', details: '' })
        }
      />
    </div>
  );
};

export default SkillsPageSelector;
