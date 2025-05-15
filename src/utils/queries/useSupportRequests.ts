
/**
 * DEPRECATED HOOK - DO NOT USE FOR NEW FEATURES
 * 
 * This hook previously combined data from multiple tables (support_requests, goods_exchange)
 * Now you should use the dedicated hooks:
 * - useGoodsExchange
 * - useSkillsExchange
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger
const logger = createLogger('useSupportRequests');

/**
 * This hook fetches support requests from the database
 * @deprecated Use dedicated hooks instead
 */
export const useSupportRequests = () => {
  logger.warn("useSupportRequests is deprecated - use useGoodsExchange or useSkillsExchange instead");

  return useQuery({
    queryKey: ["support-requests"],
    queryFn: async () => {
      logger.warn("Deprecated hook called - please update your code to use dedicated hooks");
      
      // Return empty data to encourage migration to new hooks
      return [];
    },
  });
};
