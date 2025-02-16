
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSkillsExchange = () => {
  return useQuery({
    queryKey: ['skills-exchange'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills_exchange')
        .select(`
          *,
          profiles (
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};
