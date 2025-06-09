
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
   * Enhanced skill selection handler with detailed logging and category validation
   */
  const handleSkillSelection = async (skillName: string) => {
    console.log('🎯 Skill selection initiated:', {
      skillName,
      currentCategory,
      timestamp: new Date().toISOString()
    });

    if (!currentCategory) {
      console.error('❌ Cannot select skill without category - currentCategory is null');
      return;
    }

    // Call the hook's skill select handler with validated category
    try {
      await handleSkillSelect(skillName, currentCategory);
    } catch (error) {
      console.error('❌ Error in skill selection handler:', error);
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
    <div className="space-y-6">
      {/* Header with back button for multi-category mode */}
      <SkillsPageHeader
        categoryTitle={categoryTitle}
        multiCategoryMode={multiCategoryMode}
        onBackToCategories={handleBackToCategories}
      />

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
        onSkillSelect={handleSkillSelection} // Use the enhanced handler
      />

      {/* Custom skill input */}
      <CustomSkillInput
        categoryTitle={categoryTitle}
        onAddCustomSkill={(skillName) => {
          if (currentCategory) {
            handleCustomSkillAdd(skillName, currentCategory);
          } else {
            console.error('❌ Cannot add custom skill without category');
          }
        }}
      />

      {/* Special skill details dialog */}
      <SpecialSkillDialog
        isOpen={specialSkillDialog.isOpen}
        skillName={specialSkillDialog.skillName}
        details={specialSkillDialog.details}
        onDetailsChange={(details) => 
          setSpecialSkillDialog(prev => ({ ...prev, details }))
        }
        onConfirm={() => {
          if (currentCategory) {
            handleSpecialSkillConfirm(currentCategory);
          } else {
            console.error('❌ Cannot confirm special skill without category');
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
