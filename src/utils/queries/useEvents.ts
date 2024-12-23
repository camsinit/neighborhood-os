import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          profiles:host_id (
            display_name
          )
        `)
        .order("time", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};