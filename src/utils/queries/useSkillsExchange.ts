
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSkillsExchange = () => {
  return useQuery({
    queryKey: ['skills-exchange'],
    queryFn: async () => {
      // Log the query attempt
      console.log('Fetching skills exchange data');

      const { data, error } = await supabase
        .from('skills_exchange')
        .select(`
          *,
          profiles (
            id,
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching skills exchange:', error);
        throw error;
      }

      // Log the returned data
      console.log('Skills exchange data:', data);
      return data;
    },
  });
};
