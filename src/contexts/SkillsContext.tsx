
/**
 * SkillsContext
 * 
 * Provides global state management for skills-related data and operations.
 * This helps reduce prop drilling and simplifies component interaction.
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skill, SkillCategory, SkillWithProfile, isValidRequestType } from '@/components/skills/types/skillTypes';
import { SkillFormData } from '@/components/skills/types/skillFormTypes';
import { useCurrentNeighborhood } from '@/hooks/useCurrentNeighborhood';
import { useUser } from '@supabase/auth-helpers-react';
import * as skillsService from '@/services/skills/skillsService';
import { toast } from 'sonner';

// Define the context shape
interface SkillsContextType {
  skills: SkillWithProfile[];
  isLoading: boolean;
  selectedCategory: SkillCategory | null;
  setSelectedCategory: (category: SkillCategory | null) => void;
  createSkill: (formData: Partial<SkillFormData>, mode: 'offer' | 'request') => Promise<void>;
  updateSkill: (skillId: string, formData: Partial<SkillFormData>) => Promise<void>;
  deleteSkill: (skillId: string, skillTitle: string) => Promise<void>;
  checkForDuplicates: (title: string, category: string, mode: 'offer' | 'request') => Promise<any[]>;
  isDeleting: boolean;
}

// Create the context
const SkillsContext = createContext<SkillsContextType | undefined>(undefined);

// Provider component
export const SkillsProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const user = useUser();
  const neighborhood = useCurrentNeighborhood();
  const queryClient = useQueryClient();

  // Fetch skills data
  const { data: rawSkills = [], isLoading } = useQuery({
    queryKey: ['skills-exchange', selectedCategory],
    queryFn: () => skillsService.fetchSkills(selectedCategory || undefined),
    enabled: !!neighborhood?.id,
  });

  // Validate and transform the skills to ensure they match our expected types
  const skills: SkillWithProfile[] = rawSkills.map(skill => {
    // Ensure request_type is valid, defaulting to 'offer' if invalid
    const requestType = isValidRequestType(skill.request_type) ? skill.request_type : 'offer';
    
    // Create a properly typed skill object
    return {
      ...skill,
      request_type: requestType,
      // Ensure other critical fields have appropriate defaults
      time_preferences: skill.time_preferences || null,
      // Make sure we include the profiles data
      profiles: skill.profiles || { avatar_url: null, display_name: null }
    };
  });

  // Create a new skill
  const createSkill = async (formData: Partial<SkillFormData>, mode: 'offer' | 'request') => {
    try {
      if (!user || !neighborhood?.id) {
        toast.error("You must be logged in to create a skill");
        return;
      }

      // Pass neighborhood.id (string) instead of the whole neighborhood object
      await skillsService.createSkill(formData, mode, user.id, neighborhood.id);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      
      toast.success(mode === 'offer' ? 'Skill offered successfully!' : 'Skill request submitted successfully!');
    } catch (error) {
      console.error('Error creating skill:', error);
      toast.error("Failed to create skill. Please try again.");
    }
  };

  // Update an existing skill
  const updateSkill = async (skillId: string, formData: Partial<SkillFormData>) => {
    try {
      if (!user) {
        toast.error("You must be logged in to update a skill");
        return;
      }

      await skillsService.updateSkill(skillId, formData, user.id);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      
      toast.success("Skill updated successfully");
    } catch (error) {
      console.error('Error updating skill:', error);
      toast.error("Failed to update skill. Please try again.");
    }
  };

  // Delete a skill
  const deleteSkill = async (skillId: string, skillTitle: string) => {
    try {
      if (!user) {
        toast.error("You must be logged in to delete a skill");
        return;
      }

      setIsDeleting(true);
      await skillsService.deleteSkill(skillId, skillTitle, user.id);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      
      toast.success("Skill deleted successfully");
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast.error("Failed to delete skill. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Check for duplicates before submission
  const checkForDuplicates = async (title: string, category: string, mode: 'offer' | 'request') => {
    return await skillsService.checkForDuplicates(title, category, mode);
  };

  // Context value
  const value = {
    skills,
    isLoading,
    selectedCategory,
    setSelectedCategory,
    createSkill,
    updateSkill,
    deleteSkill,
    checkForDuplicates,
    isDeleting
  };

  return (
    <SkillsContext.Provider value={value}>
      {children}
    </SkillsContext.Provider>
  );
};

// Custom hook to use the skills context
export const useSkills = () => {
  const context = useContext(SkillsContext);
  if (context === undefined) {
    throw new Error('useSkills must be used within a SkillsProvider');
  }
  return context;
};
