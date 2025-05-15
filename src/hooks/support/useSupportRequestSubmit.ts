
/**
 * DEPRECATED HOOK - DO NOT USE FOR NEW FEATURES
 * 
 * This hook previously handled submissions to the support_requests table.
 * Now use the dedicated submission hooks for specific features:
 * - useGoodsExchangeSubmit
 * - useSkillsExchangeSubmit
 */
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger
const logger = createLogger('useSupportRequestSubmit');

/**
 * @deprecated Use feature-specific hooks instead
 */
interface SupportRequestSubmitProps {
  onSuccess: () => void;
}

/**
 * @deprecated Use feature-specific hooks instead
 */
export const useSupportRequestSubmit = ({ onSuccess }: SupportRequestSubmitProps) => {
  logger.warn("useSupportRequestSubmit is deprecated - use dedicated submission hooks instead");
  
  // No-op implementation to encourage migration to new hooks
  const handleSubmit = async () => {
    toast.error("This feature has been deprecated. Please update your code to use the new hooks.");
    return false;
  };
  
  const handleUpdate = async () => {
    toast.error("This feature has been deprecated. Please update your code to use the new hooks.");
    return false;
  };

  return { handleSubmit, handleUpdate };
};
