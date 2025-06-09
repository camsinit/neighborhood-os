
import { useState } from 'react';
import { SkillCategory } from '@/components/skills/types/skillTypes';
import { SPECIAL_SKILLS } from '@/components/onboarding/survey/steps/skills/skillCategories';
import { useSkillsExchange } from '@/hooks/skills/useSkillsExchange';
import { toast } from 'sonner';

/**
 * Hook for managing skill selection logic
 * Handles adding skills to database and local state management
 * SIMPLIFIED: Better error handling and logging for debugging
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

  // Hook for submitting skills to database
  const { handleSubmit } = useSkillsExchange({
    onSuccess: () => {
      console.log('✅ [useSkillSelection] Skill successfully added to database');
      onSkillAdded(); // Notify parent component
    }
  });

  /**
   * SIMPLIFIED skill selection handler - main entry point
   */
  const handleSkillSelect = async (skillName: string, currentCategory: SkillCategory) => {
    console.log('🔄 [useSkillSelection] handleSkillSelect called:', { 
      skillName, 
      currentCategory,
      timestamp: new Date().toISOString()
    });
    
    // Validate inputs early
    if (!skillName || !currentCategory) {
      const errorMsg = 'Missing required data for skill selection';
      console.error('❌ [useSkillSelection]', errorMsg, { skillName, currentCategory });
      toast.error(errorMsg);
      return;
    }
    
    // Check if already selected
    const isSelected = selectedSkills.some(skill => 
      skill.name === skillName && skill.category === currentCategory
    );
    
    if (isSelected) {
      console.log('🗑️ [useSkillSelection] Removing skill from local selection:', skillName);
      setSelectedSkills(prev => prev.filter(skill => 
        !(skill.name === skillName && skill.category === currentCategory)
      ));
      return;
    }

    // Check if this skill requires additional details
    if (SPECIAL_SKILLS[skillName as keyof typeof SPECIAL_SKILLS]) {
      console.log('📝 [useSkillSelection] Skill requires special details, opening dialog:', skillName);
      setSpecialSkillDialog({
        isOpen: true,
        skillName,
        details: ''
      });
      return;
    }

    // Submit regular skill directly
    try {
      console.log('💾 [useSkillSelection] Submitting regular skill to database...');
      await submitSkillToDatabase(skillName, currentCategory);
    } catch (error) {
      console.error('❌ [useSkillSelection] Failed to submit regular skill:', error);
      throw error; // Re-throw so parent can handle
    }
  };

  /**
   * CENTRALIZED database submission function
   */
  const submitSkillToDatabase = async (skillName: string, category: SkillCategory, description?: string) => {
    console.log('💾 [useSkillSelection] submitSkillToDatabase called:', { 
      skillName, 
      category,
      hasDescription: !!description,
      timestamp: new Date().toISOString()
    });
    
    try {
      // Use the skills exchange hook to submit to database
      await handleSubmit({
        title: skillName,
        category: category,
        description: description || `${skillName} skill in ${category}`
      }, 'offer');
      
      // Add to local selection for UI feedback only after successful submission
      setSelectedSkills(prev => [...prev, { 
        name: skillName, 
        category: category,
        details: description
      }]);
      
      console.log('✅ [useSkillSelection] Skill submitted successfully:', skillName);
      toast.success(`${skillName} skill added successfully!`);
    } catch (error) {
      console.error('❌ [useSkillSelection] Database submission failed:', {
        error: error instanceof Error ? error.message : error,
        skillName,
        category,
        timestamp: new Date().toISOString()
      });
      toast.error(`Failed to add ${skillName}. Please try again.`);
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
      category: currentCategory
    });

    if (!specialSkillDialog.skillName || !specialSkillDialog.details.trim() || !currentCategory) {
      const errorMsg = 'Please provide details for this skill';
      console.warn('⚠️ [useSkillSelection] Missing special skill data');
      toast.error(errorMsg);
      return;
    }

    try {
      await submitSkillToDatabase(
        specialSkillDialog.skillName, 
        currentCategory, 
        specialSkillDialog.details.trim()
      );
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
    console.log('🔄 [useSkillSelection] handleCustomSkillAdd called:', { skillName, currentCategory });

    if (!currentCategory || !skillName.trim()) {
      const errorMsg = 'Please provide a skill name';
      console.warn('⚠️ [useSkillSelection] Invalid custom skill data');
      toast.error(errorMsg);
      return;
    }

    try {
      await submitSkillToDatabase(
        skillName.trim(), 
        currentCategory, 
        `Custom ${skillName.trim()} skill in ${currentCategory}`
      );
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
