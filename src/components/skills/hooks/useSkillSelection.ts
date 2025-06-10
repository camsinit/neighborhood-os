
import { useState } from 'react';
import { SkillCategory } from '@/components/skills/types/skillTypes';
import { SPECIAL_SKILLS } from '@/components/onboarding/survey/steps/skills/skillCategories';
import { useSkillsExchange } from '@/hooks/skills/useSkillsExchange';
import { useCurrentNeighborhood } from '@/hooks/useCurrentNeighborhood';
import { toast } from 'sonner';

/**
 * Hook for managing skill selection logic
 * Handles adding skills to database and local state management
 * FIXED: Added comprehensive debugging and proper async/await handling
 */
interface SelectedSkill {
  name: string;
  details?: string;
  category: SkillCategory;
}

interface UseSkillSelectionProps {
  onSkillAdded: () => void;
}

export const useSkillSelection = ({ onSkillAdded }: UseSkillSelectionProps) => {
  // Track selected skills for this session (for UI feedback only)
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);
  
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

  // Get current neighborhood context
  const neighborhood = useCurrentNeighborhood();

  // Hook for submitting skills to database
  const { handleSubmit } = useSkillsExchange({
    onSuccess: () => {
      console.log('✅ [useSkillSelection] Skill successfully added to database via handleSubmit');
      onSkillAdded(); // Notify parent component
    }
  });

  /**
   * MAIN ENTRY POINT - skill selection handler with comprehensive debugging
   */
  const handleSkillSelect = async (skillName: string, currentCategory: SkillCategory) => {
    console.log('🔄 [useSkillSelection] handleSkillSelect ENTRY POINT:', { 
      skillName, 
      currentCategory,
      neighborhoodId: neighborhood?.id,
      neighborhoodName: neighborhood?.name,
      timestamp: new Date().toISOString()
    });
    
    // STEP 1: Validate inputs early
    if (!skillName || !currentCategory) {
      const errorMsg = 'Missing required data for skill selection';
      console.error('❌ [useSkillSelection] VALIDATION FAILED:', { skillName, currentCategory });
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    // STEP 2: Validate neighborhood context
    if (!neighborhood?.id) {
      const errorMsg = 'No neighborhood selected - cannot add skill';
      console.error('❌ [useSkillSelection] NEIGHBORHOOD VALIDATION FAILED:', { 
        neighborhood,
        hasNeighborhood: !!neighborhood,
        neighborhoodId: neighborhood?.id
      });
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    console.log('✅ [useSkillSelection] All validations passed');
    
    // STEP 3: Check if already selected
    const isSelected = selectedSkills.some(skill => 
      skill.name === skillName && skill.category === currentCategory
    );
    
    if (isSelected) {
      console.log('🗑️ [useSkillSelection] Skill already selected, removing from local selection:', skillName);
      setSelectedSkills(prev => prev.filter(skill => 
        !(skill.name === skillName && skill.category === currentCategory)
      ));
      return { action: 'removed', skillName };
    }

    // STEP 4: Check if this skill requires additional details
    if (SPECIAL_SKILLS[skillName as keyof typeof SPECIAL_SKILLS]) {
      console.log('📝 [useSkillSelection] Skill requires special details, opening dialog:', skillName);
      setSpecialSkillDialog({
        isOpen: true,
        skillName,
        details: ''
      });
      return { action: 'dialog_opened', skillName };
    }

    // STEP 5: Submit regular skill directly
    console.log('💾 [useSkillSelection] Submitting regular skill to database...');
    try {
      const result = await submitSkillToDatabase(skillName, currentCategory);
      console.log('✅ [useSkillSelection] Regular skill submitted successfully:', result);
      return { action: 'submitted', skillName, result };
    } catch (error) {
      console.error('❌ [useSkillSelection] Failed to submit regular skill:', error);
      throw error; // Re-throw so parent can handle
    }
  };

  /**
   * CENTRALIZED database submission function with comprehensive debugging
   */
  const submitSkillToDatabase = async (skillName: string, category: SkillCategory, description?: string) => {
    console.log('💾 [useSkillSelection] submitSkillToDatabase ENTRY POINT:', { 
      skillName, 
      category,
      hasDescription: !!description,
      description: description?.substring(0, 50) + (description && description.length > 50 ? '...' : ''),
      neighborhoodId: neighborhood?.id,
      timestamp: new Date().toISOString()
    });
    
    try {
      // STEP 1: Prepare submission data
      const submissionData = {
        title: skillName,
        category: category,
        description: description || `${skillName} skill in ${category}`
      };

      console.log('📤 [useSkillSelection] About to call handleSubmit with:', submissionData);

      // STEP 2: Submit to database using the skills exchange hook
      const result = await handleSubmit(submissionData, 'offer');
      
      console.log('✅ [useSkillSelection] handleSubmit completed successfully:', {
        result,
        skillName,
        category,
        timestamp: new Date().toISOString()
      });

      // STEP 3: Add to local selection for UI feedback only after successful submission
      setSelectedSkills(prev => {
        const newSkill = { 
          name: skillName, 
          category: category,
          details: description
        };
        const updated = [...prev, newSkill];
        console.log('📝 [useSkillSelection] Updated local selectedSkills:', updated);
        return updated;
      });
      
      console.log('🎉 [useSkillSelection] Skill submission process completed successfully');
      toast.success(`${skillName} skill added successfully!`);
      
      return result;
    } catch (error) {
      console.error('❌ [useSkillSelection] Database submission FAILED:', {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        skillName,
        category,
        neighborhoodId: neighborhood?.id,
        timestamp: new Date().toISOString()
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to add ${skillName}: ${errorMessage}`);
      throw error; // Re-throw for parent component
    }
  };

  /**
   * Handle special skill dialog confirmation
   */
  const handleSpecialSkillConfirm = async (currentCategory: SkillCategory) => {
    console.log('🔄 [useSkillSelection] handleSpecialSkillConfirm called:', {
      skillName: specialSkillDialog.skillName,
      hasDetails: !!specialSkillDialog.details.trim(),
      category: currentCategory,
      timestamp: new Date().toISOString()
    });

    if (!specialSkillDialog.skillName || !specialSkillDialog.details.trim() || !currentCategory) {
      const errorMsg = 'Please provide details for this skill';
      console.warn('⚠️ [useSkillSelection] Special skill validation failed');
      toast.error(errorMsg);
      return;
    }

    try {
      await submitSkillToDatabase(
        specialSkillDialog.skillName, 
        currentCategory, 
        specialSkillDialog.details.trim()
      );
      console.log('✅ [useSkillSelection] Special skill submitted successfully');
    } catch (error) {
      console.error('❌ [useSkillSelection] Special skill submission failed:', error);
      // Error already handled in submitSkillToDatabase
    }
    
    // Close the dialog regardless of outcome
    setSpecialSkillDialog({ isOpen: false, skillName: '', details: '' });
  };

  /**
   * Handle custom skill addition
   */
  const handleCustomSkillAdd = async (skillName: string, currentCategory: SkillCategory) => {
    console.log('🔄 [useSkillSelection] handleCustomSkillAdd called:', { 
      skillName, 
      currentCategory,
      timestamp: new Date().toISOString()
    });

    if (!currentCategory || !skillName.trim()) {
      const errorMsg = 'Please provide a skill name';
      console.warn('⚠️ [useSkillSelection] Custom skill validation failed');
      toast.error(errorMsg);
      return;
    }

    try {
      await submitSkillToDatabase(
        skillName.trim(), 
        currentCategory, 
        `Custom ${skillName.trim()} skill in ${currentCategory}`
      );
      console.log('✅ [useSkillSelection] Custom skill submitted successfully');
    } catch (error) {
      console.error('❌ [useSkillSelection] Custom skill submission failed:', error);
      // Error already handled in submitSkillToDatabase
    }
  };

  /**
   * Remove a skill from local selection (visual feedback only)
   */
  const removeSkill = (skillName: string, category: SkillCategory) => {
    console.log('🗑️ [useSkillSelection] Removing skill from local display:', { skillName, category });
    setSelectedSkills(prev => prev.filter(skill => 
      !(skill.name === skillName && skill.category === category)
    ));
  };

  return {
    selectedSkills,
    specialSkillDialog,
    setSpecialSkillDialog,
    handleSkillSelect,
    handleSpecialSkillConfirm,
    handleCustomSkillAdd,
    removeSkill
  };
};
