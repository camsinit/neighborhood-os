import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSupportRequests = () => {
  return useQuery({
    queryKey: ["support-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_requests")
        .select("*, profiles(display_name, avatar_url)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};