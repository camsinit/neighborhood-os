import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSafetyUpdates = () => {
  return useQuery({
    queryKey: ["safety-updates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("safety_updates")
        .select("*, profiles(display_name, avatar_url)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};