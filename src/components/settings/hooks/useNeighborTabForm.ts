
import { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { ProfileFormValues } from "../types";
import { SKILL_CATEGORIES } from "../../onboarding/survey/steps/skills/skillCategories";

/**
 * Custom hook for handling the Neighbor tab form logic
 * 
 * This hook provides utilities for managing user settings related to
 * their neighborhood profile, including skills and visibility settings.
 * 
 * @param form - The form instance from react-hook-form
 */
export const useNeighborTabForm = (form: UseFormReturn<ProfileFormValues>) => {
  // Extract all skills from categories into a flat array for display
  const flattenedSkills = Object.values(SKILL_CATEGORIES).reduce(
    (acc, category) => [...acc, ...category.skills],
    [] as string[]
  );

  // Get skill categories for the selection dropdown
  const skillCategories = Object.keys(SKILL_CATEGORIES);

  /**
   * Add a skill to the user's profile
   * @param skill - The skill to add
   */
  const addSkill = (skill: string) => {
    const currentSkills = form.getValues("skills") || [];
    
    // Don't add if already exists
    if (currentSkills.includes(skill)) {
      return;
    }
    
    // Update the form with the new skill
    form.setValue("skills", [...currentSkills, skill]);
  };

  /**
   * Remove a skill from the user's profile
   * @param index - The index of the skill to remove
   */
  const removeSkill = (index: number) => {
    const currentSkills = form.getValues("skills") || [];
    const updatedSkills = currentSkills.filter((_, i) => i !== index);
    form.setValue("skills", updatedSkills);
  };

  return {
    skillCategories,
    flattenedSkills,
    addSkill,
    removeSkill,
  };
};
