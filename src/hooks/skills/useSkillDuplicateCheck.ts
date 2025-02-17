
// Custom hook to check for duplicate skills
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { SkillFormData } from "@/components/skills/types/skillFormTypes";

export const useSkillDuplicateCheck = (formData: Partial<SkillFormData>, mode: 'offer' | 'request') => {
  // Query to check for existing skills with similar title in the same category
  return useQuery({
    // Only run the query if we have both title and category
    enabled: !!(formData.title && formData.category),
    queryKey: ['skill-duplicate-check', formData.title, formData.category, mode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills_exchange')
        .select('id, title')
        .ilike('title', `%${formData.title}%`) // Case-insensitive search
        .eq('skill_category', formData.category)
        .eq('request_type', mode === 'offer' ? 'offer' : 'need');

      if (error) throw error;
      return data;
    },
  });
};
