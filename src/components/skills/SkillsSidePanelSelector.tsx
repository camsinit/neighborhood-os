import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SkillCategory } from '@/components/skills/types/skillTypes';
import { SKILL_CATEGORIES } from '@/components/onboarding/survey/steps/skills/skillCategories';
import CompactCategorySelector from './components/CompactCategorySelector';
import SkillList from './components/SkillList';
import SelectedSkillsBar from './components/SelectedSkillsBar';
import CustomSkillInput from './components/CustomSkillInput';
import SpecialSkillDialog from './components/SpecialSkillDialog';
import { useSkillSelection } from './hooks/useSkillSelection';
import { toast } from 'sonner';

/**
 * SkillsSidePanelSelector - Complete redesign for side panel skill offering
 * 
 * Features:
 * - Single-column, mobile-first design optimized for 400px-540px width
 * - Progressive disclosure with smooth navigation
 * - Search functionality for categories
 * - List-based skill selection (not grid)
 * - Persistent selected skills bar
 * - Enhanced visual hierarchy with skills theme
 * - Improved touch interactions for mobile
 * - Better accessibility and keyboard navigation
 * 
 * Replaces the cramped SkillsPageSelector for side panel use cases
 */
interface SkillsSidePanelSelectorProps {
  selectedCategory?: SkillCategory;
  onSkillAdded: () => void;
  multiCategoryMode?: boolean;
  onClose?: () => void; // For closing the side panel
}

const SkillsSidePanelSelector: React.FC<SkillsSidePanelSelectorProps> = ({
  selectedCategory,
  onSkillAdded,
  multiCategoryMode = false,
  onClose
}) => {
  // Navigation state for progressive disclosure
  const [currentStep, setCurrentStep] = useState<'categories' | 'skills'>(() => {
    // If we have a selected category, go directly to skills
    // Otherwise start with categories in multi-category mode
    return selectedCategory || !multiCategoryMode ? 'skills' : 'categories';
  });
  
  const [currentCategory, setCurrentCategory] = useState<SkillCategory | null>(
    selectedCategory || null
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

  // Get skills and info for the current category
  const categorySkills = currentCategory ? SKILL_CATEGORIES[currentCategory]?.skills || [] : [];
  const categoryTitle = currentCategory ? SKILL_CATEGORIES[currentCategory]?.title || currentCategory : '';

  /**
   * Handle category selection - navigates to skills step
   */
  const handleCategorySelect = (category: SkillCategory) => {
    console.log('📂 [SkillsSidePanel] Category selected:', category);
    setCurrentCategory(category);
    setCurrentStep('skills');
  };

  /**
   * Navigate back to categories
   */
  const handleBackToCategories = () => {
    console.log('⬅️ [SkillsSidePanel] Going back to categories');
    setCurrentStep('categories');
    // Don't clear currentCategory so we can keep context
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
   * Enhanced skill selection handler with comprehensive debugging
   */
  const handleSkillSelection = async (skillName: string) => {
    console.log('🎯 [SkillsSidePanel] handleSkillSelection ENTRY POINT:', {
      skillName,
      currentCategory,
      categoryTitle,
      hasCategory: !!currentCategory,
      timestamp: new Date().toISOString()
    });

    // Validation - must have category
    if (!currentCategory) {
      console.error('❌ [SkillsSidePanel] VALIDATION FAILED - no current category');
      toast.error('Please select a category first');
      return;
    }

    try {
      console.log('🔄 [SkillsSidePanel] About to call handleSkillSelect');
      const result = await handleSkillSelect(skillName, currentCategory);
      console.log('✅ [SkillsSidePanel] handleSkillSelect completed:', result);
    } catch (error) {
      console.error('❌ [SkillsSidePanel] handleSkillSelect ERROR:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to add skill: ${errorMessage}`);
    }
  };

  /**
   * Handle custom skill addition
   */
  const handleCustomSkill = (skillName: string) => {
    console.log('🎯 [SkillsSidePanel] Custom skill add requested:', { skillName, currentCategory });
    if (currentCategory) {
      handleCustomSkillAdd(skillName, currentCategory);
    } else {
      console.error('❌ Cannot add custom skill without category');
      toast.error('Please select a category first');
    }
  };

  /**
   * Handle special skill confirmation
   */
  const handleSpecialSkillComplete = () => {
    console.log('🎯 [SkillsSidePanel] Special skill confirm requested:', { 
      skillName: specialSkillDialog.skillName, 
      currentCategory 
    });
    if (currentCategory) {
      handleSpecialSkillConfirm(currentCategory);
    } else {
      console.error('❌ Cannot confirm special skill without category');
      toast.error('Please select a category first');
    }
  };

  // Render categories step
  if (currentStep === 'categories') {
    return (
      <div className="flex flex-col h-full">

        {/* Category selection */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <CompactCategorySelector
            onCategorySelect={handleCategorySelect}
            selectedSkillsCount={selectedSkills.length}
          />
        </div>

        {/* Selected skills bar */}
        <SelectedSkillsBar
          selectedSkills={selectedSkills}
          onRemoveSkill={removeSkill}
          onFinish={onClose}
          isVisible={selectedSkills.length > 0}
        />
      </div>
    );
  }

  // Render skills step
  return (
    <div className="relative flex flex-col h-full">
      {/* Header with navigation */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        {multiCategoryMode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToCategories}
            className="p-1 hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        
        <div className="flex items-center gap-3 flex-1">
          <div className="w-1 h-6 rounded-full bg-skills" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">{categoryTitle}</h2>
            <p className="text-xs text-muted-foreground">Select skills to share with neighbors</p>
          </div>
        </div>
        
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        )}
      </div>

      {/* Skills selection content with proper bottom padding for selected skills bar */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6 pb-32">
          {/* Skills list - the main improvement: list instead of grid */}
          <SkillList
            skills={categorySkills}
            selectedSkills={getSelectedSkillNames()}
            onSkillSelect={handleSkillSelection}
          />

          {/* Custom skill input */}
          <CustomSkillInput
            categoryTitle={categoryTitle}
            onAddCustomSkill={handleCustomSkill}
          />
        </div>
      </div>

      {/* Selected skills bar - positioned absolutely to avoid layout issues */}
      <div className="absolute bottom-0 left-0 right-0">
        <SelectedSkillsBar
          selectedSkills={selectedSkills.filter(skill => skill.category === currentCategory)}
          onRemoveSkill={removeSkill}
          onFinish={onClose}
          isVisible={selectedSkills.some(skill => skill.category === currentCategory)}
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
        onConfirm={handleSpecialSkillComplete}
        onCancel={() => 
          setSpecialSkillDialog({ isOpen: false, skillName: '', details: '' })
        }
      />
    </div>
  );
};

export default SkillsSidePanelSelector;
