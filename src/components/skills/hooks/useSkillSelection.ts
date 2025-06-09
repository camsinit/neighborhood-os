
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
      console.log('Skill successfully added to database');
      onSkillAdded(); // Notify parent component
    }
  });

  /**
   * Handle skill selection toggle - properly submit to database
   */
  const handleSkillSelect = async (skillName: string, currentCategory: SkillCategory) => {
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
   * Handle special skill dialog confirmation
   */
  const handleSpecialSkillConfirm = async (currentCategory: SkillCategory) => {
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
   * Handle custom skill addition
   */
  const handleCustomSkillAdd = async (skillName: string, currentCategory: SkillCategory) => {
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
   * Remove a skill from local selection (visual feedback only)
   */
  const removeSkill = (skillName: string, category: SkillCategory) => {
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
