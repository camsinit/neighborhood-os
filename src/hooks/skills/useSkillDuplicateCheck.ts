
// Custom hook to check for duplicate skills
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { SkillFormData } from "@/components/skills/types/skillFormTypes";
import { mapToCurrentCategory } from "@/components/skills/types/skillTypes";

export const useSkillDuplicateCheck = (formData: Partial<SkillFormData>, mode: 'offer' | 'request') => {
  // Query to check for existing skills with similar title in the same category
  return useQuery({
    // Only run the query if we have both title and category
    enabled: !!(formData.title && formData.category),
    queryKey: ['skill-duplicate-check', formData.title, formData.category, mode],
    queryFn: async () => {
      // Fetch all skills with similar titles, then filter by mapped category
      const { data: allData, error } = await supabase
        .from('skills_exchange')
        .select('id, title, skill_category')
        .ilike('title', `%${formData.title}%`) // Case-insensitive search
        .eq('request_type', mode === 'offer' ? 'offer' : 'need'); // Fixed: use 'need' not 'request'

      if (error) throw error;

      // Filter by mapped category (includes legacy category mapping)
      const data = allData?.filter(skill => 
        mapToCurrentCategory(skill.skill_category) === formData.category
      ) || [];

      return data;
    },
  });
};
