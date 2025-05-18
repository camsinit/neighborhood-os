
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "../types";
import { SkillCategory } from "@/components/skills/types/skillTypes";

/**
 * Hook for handling NeighborTab form logic
 * 
 * Centralizes the logic for the neighbor tab in the settings form
 * 
 * @param form - The form instance from react-hook-form
 * @returns The form instance and additional methods/data needed by the NeighborTab
 */
export const useNeighborTabForm = (form: UseFormReturn<ProfileFormValues>) => {
  // Define all available skill categories that can be added
  const skillCategories: SkillCategory[] = ['technology', 'creative', 'trade', 'education', 'wellness'];
  
  /**
   * Add a skill to the user's skills array
   * 
   * @param skill - The skill to add
   */
  const addSkill = (skill: string) => {
    const currentSkills = form.getValues().skills || [];
    if (!currentSkills.includes(skill)) {
      form.setValue('skills', [...currentSkills, skill], { shouldDirty: true });
    }
  };
  
  /**
   * Remove a skill from the user's skills array
   * 
   * @param index - The index of the skill to remove
   */
  const removeSkill = (index: number) => {
    const newSkills = form.getValues().skills?.filter((_, i) => i !== index);
    form.setValue('skills', newSkills || [], { shouldDirty: true });
  };
  
  return {
    form,
    skillCategories,
    addSkill,
    removeSkill
  };
};
