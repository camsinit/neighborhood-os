
import { useState } from 'react';
import { SkillCategory } from '@/components/skills/types/skillTypes';
import { SPECIAL_SKILLS } from '@/components/onboarding/survey/steps/skills/skillCategories';
import { useSkillsExchange } from '@/hooks/skills/useSkillsExchange';
import { toast } from 'sonner';

/**
 * Hook for managing skill selection logic
 * Handles adding skills to database and local state management
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
      console.log('✅ Skill successfully added to database');
      onSkillAdded(); // Notify parent component
    }
  });

  /**
   * Handle skill selection toggle - properly submit to database
   */
  const handleSkillSelect = async (skillName: string, currentCategory: SkillCategory) => {
    console.log('🔄 handleSkillSelect called with:', { skillName, currentCategory });
    
    if (!currentCategory) {
      console.error('❌ No category provided for skill selection');
      return;
    }
    
    const isSelected = selectedSkills.some(skill => 
      skill.name === skillName && skill.category === currentCategory
    );
    
    if (isSelected) {
      // Remove skill from local UI selection (Note: this doesn't delete from database)
      console.log('🗑️ Removing skill from local selection:', skillName);
      setSelectedSkills(prev => prev.filter(skill => 
        !(skill.name === skillName && skill.category === currentCategory)
      ));
      return;
    }

    // Check if this skill requires additional details
    if (SPECIAL_SKILLS[skillName as keyof typeof SPECIAL_SKILLS]) {
      console.log('📝 Skill requires special details, opening dialog:', skillName);
      setSpecialSkillDialog({
        isOpen: true,
        skillName,
        details: ''
      });
    } else {
      // Submit skill immediately to database
      try {
        console.log('💾 Submitting regular skill to database:', { 
          skillName, 
          category: currentCategory,
          timestamp: new Date().toISOString()
        });
        
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
        
        console.log('✅ Regular skill submitted successfully:', skillName);
        toast.success(`${skillName} skill added successfully!`);
      } catch (error) {
        console.error('❌ Error adding regular skill:', {
          error: error instanceof Error ? error.message : error,
          skillName,
          category: currentCategory,
          timestamp: new Date().toISOString()
        });
        toast.error('Failed to add skill. Please try again.');
      }
    }
  };

  /**
   * Handle special skill dialog confirmation
   */
  const handleSpecialSkillConfirm = async (currentCategory: SkillCategory) => {
    console.log('🔄 handleSpecialSkillConfirm called:', {
      skillName: specialSkillDialog.skillName,
      hasDetails: !!specialSkillDialog.details.trim(),
      category: currentCategory
    });

    if (specialSkillDialog.skillName && specialSkillDialog.details.trim() && currentCategory) {
      try {
        console.log('💾 Submitting special skill to database:', { 
          skillName: specialSkillDialog.skillName, 
          details: specialSkillDialog.details,
          category: currentCategory,
          timestamp: new Date().toISOString()
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
        
        console.log('✅ Special skill submitted successfully:', specialSkillDialog.skillName);
        toast.success(`${specialSkillDialog.skillName} skill added successfully!`);
      } catch (error) {
        console.error('❌ Error adding special skill:', {
          error: error instanceof Error ? error.message : error,
          skillName: specialSkillDialog.skillName,
          category: currentCategory,
          timestamp: new Date().toISOString()
        });
        toast.error('Failed to add skill. Please try again.');
      }
    } else {
      console.warn('⚠️ Special skill confirmation called with missing data:', {
        hasSkillName: !!specialSkillDialog.skillName,
        hasDetails: !!specialSkillDialog.details.trim(),
        hasCategory: !!currentCategory
      });
    }
    setSpecialSkillDialog({ isOpen: false, skillName: '', details: '' });
  };

  /**
   * Handle custom skill addition
   */
  const handleCustomSkillAdd = async (skillName: string, currentCategory: SkillCategory) => {
    console.log('🔄 handleCustomSkillAdd called with:', { skillName, currentCategory });

    if (currentCategory && skillName.trim()) {
      try {
        console.log('💾 Submitting custom skill to database:', { 
          skillName, 
          category: currentCategory,
          timestamp: new Date().toISOString()
        });
        
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
        
        console.log('✅ Custom skill submitted successfully:', skillName.trim());
        toast.success(`${skillName.trim()} skill added successfully!`);
      } catch (error) {
        console.error('❌ Error adding custom skill:', {
          error: error instanceof Error ? error.message : error,
          skillName,
          category: currentCategory,
          timestamp: new Date().toISOString()
        });
        toast.error('Failed to add custom skill. Please try again.');
      }
    } else {
      console.warn('⚠️ Custom skill add called with invalid data:', {
        hasSkillName: !!skillName?.trim(),
        hasCategory: !!currentCategory
      });
    }
  };

  /**
   * Remove a skill from local selection (visual feedback only)
   */
  const removeSkill = (skillName: string, category: SkillCategory) => {
    console.log('🗑️ Removing skill from local display:', { skillName, category });
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
