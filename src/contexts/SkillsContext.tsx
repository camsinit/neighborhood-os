/**
 * Consolidated SkillsContext
 * 
 * Unified skills management with all functionality consolidated:
 * - Skills fetching and preview
 * - Skills submission and management
 * - Real-time updates and caching
 * - Form handling and validation
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { Skill, SkillCategory, SkillWithProfile, isValidRequestType, mapToCurrentCategory } from '@/components/skills/types/skillTypes';
import { SkillFormData } from '@/components/skills/types/skillFormTypes';
import { useCurrentNeighborhood } from '@/hooks/useCurrentNeighborhood';
import { useUser } from '@supabase/auth-helpers-react';
import * as skillsService from '@/services/skills/skillsService';
import { toast } from 'sonner';
import { unifiedEvents } from '@/utils/unifiedEventSystem';
import { createLogger } from '@/utils/logger';

// Create logger for the skills system
const logger = createLogger('SkillsContext');

// Define the consolidated context shape
interface SkillsContextType {
  // Skills data
  skills: SkillWithProfile[];
  isLoading: boolean;
  
  // Category management
  selectedCategory: SkillCategory | null;
  setSelectedCategory: (category: SkillCategory | null) => void;
  
  // Skills operations
  createSkill: (formData: Partial<SkillFormData>, mode: 'offer' | 'need') => Promise<void>;
  updateSkill: (skillId: string, formData: Partial<SkillFormData>) => Promise<void>;
  deleteSkill: (skillId: string, skillTitle: string) => Promise<void>;
  checkForDuplicates: (title: string, category: string, mode: 'offer' | 'need') => Promise<any[]>;
  
  // Preview and grouped data
  skillsPreview: Record<SkillCategory, { offers: string[], requests: string[] }>;
  isPreviewLoading: boolean;
  
  // Loading states
  isDeleting: boolean;
  isSubmitting: boolean;
  
  // Control functions
  refetchSkills: () => void;
}

// Create the context
const SkillsContext = createContext<SkillsContextType | undefined>(undefined);

// Provider component
export const SkillsProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useUser();
  const neighborhood = useCurrentNeighborhood();
  const queryClient = useQueryClient();

  // Set up real-time subscription for skills updates
  useEffect(() => {
    if (!neighborhood?.id) return;
    
    const channel = supabase
      .channel('skills-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'skills_exchange',
          filter: `neighborhood_id=eq.${neighborhood.id}`
        },
        () => {
          logger.info('Skills data changed, refetching...');
          queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
          queryClient.invalidateQueries({ queryKey: ['skills-preview'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [neighborhood?.id, queryClient]);

  // Fetch skills data with caching and real-time updates
  const { data: rawSkills = [], isLoading, refetch: refetchSkills } = useQuery({
    queryKey: ['skills-exchange', selectedCategory, neighborhood?.id],
    queryFn: () => skillsService.fetchSkills(selectedCategory || undefined),
    enabled: !!neighborhood?.id,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  // Fetch skills preview data for category overview with proper default
  const { data: skillsPreview = {
    technology: { offers: [], requests: [] },
    emergency: { offers: [], requests: [] },
    professional: { offers: [], requests: [] },
    care: { offers: [], requests: [] },
    education: { offers: [], requests: [] },
    maintenance: { offers: [], requests: [] }
  }, isLoading: isPreviewLoading } = useQuery({
    queryKey: ['skills-preview', neighborhood?.id],
    queryFn: async () => {
      if (!neighborhood?.id) return {
        technology: { offers: [], requests: [] },
        emergency: { offers: [], requests: [] },
        professional: { offers: [], requests: [] },
        care: { offers: [], requests: [] },
        education: { offers: [], requests: [] },
        maintenance: { offers: [], requests: [] }
      };
      
      const { data: skills, error } = await supabase
        .from('skills_exchange')
        .select('id, title, skill_category, request_type')
        .eq('neighborhood_id', neighborhood.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching skills preview:', error);
        throw error;
      }

      // Group skills by category
      const groupedSkills: Record<SkillCategory, { offers: string[], requests: string[] }> = {
        technology: { offers: [], requests: [] },
        emergency: { offers: [], requests: [] },
        professional: { offers: [], requests: [] },
        care: { offers: [], requests: [] },
        education: { offers: [], requests: [] },
        maintenance: { offers: [], requests: [] }
      };

      skills?.forEach(skill => {
        // Map legacy categories to current categories
        const category = mapToCurrentCategory(skill.skill_category) as SkillCategory;
        if (groupedSkills[category]) {
          if (skill.request_type === 'offer') {
            groupedSkills[category].offers.push(skill.title);
          } else if (skill.request_type === 'need') {
            groupedSkills[category].requests.push(skill.title);
          }
        }
      });

      return groupedSkills;
    },
    enabled: !!neighborhood?.id,
    staleTime: 60000, // 1 minute
  });

  // Validate and transform the skills to ensure they match our expected types
  const skills: SkillWithProfile[] = rawSkills.map(skill => {
    // Ensure request_type is valid, defaulting to 'offer' if invalid
    const requestType = isValidRequestType(skill.request_type) ? skill.request_type : 'offer';
    
    // Map legacy categories to current categories
    const skillCategory = mapToCurrentCategory(skill.skill_category);
    
    // Create a properly typed skill object
    return {
      ...skill,
      request_type: requestType,
      skill_category: skillCategory,
      // Ensure other critical fields have appropriate defaults
      time_preferences: skill.time_preferences || null,
      // Make sure we include the profiles data
      profiles: skill.profiles || { avatar_url: null, display_name: null }
    };
  });

  // Create a new skill with optimistic updates
  const createSkill = async (formData: Partial<SkillFormData>, mode: 'offer' | 'need') => {
    if (!user || !neighborhood?.id) {
      toast.error("You must be logged in to create a skill");
      return;
    }

    setIsSubmitting(true);
    try {
      logger.info('Creating skill:', { title: formData.title, mode, category: formData.category });

      // Optimistic update
      const tempSkill = {
        id: 'temp-' + Date.now(),
        title: formData.title || '',
        description: formData.description || null,
        skill_category: formData.category || 'professional',
        request_type: mode === 'offer' ? 'offer' : 'need',
        user_id: user.id,
        neighborhood_id: neighborhood.id,
        created_at: new Date().toISOString(),
        profiles: { display_name: user.email, avatar_url: null }
      };

      // Update cache optimistically
      queryClient.setQueryData(['skills-exchange', selectedCategory, neighborhood.id], (old: any) => 
        old ? [tempSkill, ...old] : [tempSkill]
      );

      await skillsService.createSkill(formData, mode, user.id, neighborhood.id);
      
      // Invalidate to get real data
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      queryClient.invalidateQueries({ queryKey: ['skills-preview'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      
      toast.success(mode === 'offer' ? 'Skill offered successfully!' : 'Skill request submitted successfully!');
    } catch (error) {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      logger.error('Error creating skill:', error);
      toast.error("Failed to create skill. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update an existing skill with optimistic updates
  const updateSkill = async (skillId: string, formData: Partial<SkillFormData>) => {
    if (!user) {
      toast.error("You must be logged in to update a skill");
      return;
    }

    setIsSubmitting(true);
    try {
      logger.info('Updating skill:', { skillId, title: formData.title });

      // Optimistic update
      queryClient.setQueryData(['skills-exchange', selectedCategory, neighborhood?.id], (old: any) => 
        old?.map((skill: any) => 
          skill.id === skillId ? { ...skill, ...formData } : skill
        )
      );

      await skillsService.updateSkill(skillId, formData, user.id);
      
      // Invalidate to get real data
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      queryClient.invalidateQueries({ queryKey: ['skills-preview'] });
      
      toast.success("Skill updated successfully");
    } catch (error) {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      logger.error('Error updating skill:', error);
      toast.error("Failed to update skill. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a skill with optimistic updates
  const deleteSkill = async (skillId: string, skillTitle: string) => {
    if (!user) {
      toast.error("You must be logged in to delete a skill");
      return;
    }

    setIsDeleting(true);
    try {
      logger.info('Deleting skill:', { skillId, skillTitle });

      // Optimistic update
      queryClient.setQueryData(['skills-exchange', selectedCategory, neighborhood?.id], (old: any) => 
        old?.filter((skill: any) => skill.id !== skillId)
      );

      await skillsService.deleteSkill(skillId, skillTitle, user.id);
      
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      queryClient.invalidateQueries({ queryKey: ['skills-preview'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      
      toast.success("Skill deleted successfully");
    } catch (error) {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      logger.error('Error deleting skill:', error);
      toast.error("Failed to delete skill. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Check for duplicates before submission
  const checkForDuplicates = async (title: string, category: string, mode: 'offer' | 'need') => {
    return await skillsService.checkForDuplicates(title, category, mode);
  };

  // Context value with all consolidated functionality
  const value = {
    // Skills data
    skills,
    isLoading,
    
    // Category management
    selectedCategory,
    setSelectedCategory,
    
    // Skills operations
    createSkill,
    updateSkill,
    deleteSkill,
    checkForDuplicates,
    
    // Preview and grouped data
    skillsPreview,
    isPreviewLoading,
    
    // Loading states
    isDeleting,
    isSubmitting,
    
    // Control functions
    refetchSkills
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
