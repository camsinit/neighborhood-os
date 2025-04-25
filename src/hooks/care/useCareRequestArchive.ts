
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { refreshEvents } from '@/utils/refreshEvents';

/**
 * Hook for handling care request archival
 */
export const useCareRequestArchive = (
  user: User | null,
  onClose: () => void
) => {
  const [isArchiving, setIsArchiving] = useState(false);

  const archiveCareRequest = async (requestId: string, title: string) => {
    if (!user) {
      toast.error("You must be logged in to archive a care request");
      return false;
    }

    setIsArchiving(true);

    try {
      const { error } = await supabase
        .from('care_requests')
        .update({
          is_archived: true,
          archived_at: new Date().toISOString(),
          archived_by: user.id
        })
        .eq('id', requestId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Care request archived successfully");
      refreshEvents.care();
      onClose();
      return true;
    } catch (error) {
      console.error("[useCareRequestArchive] Error archiving care request:", error);
      toast.error("Failed to archive care request");
      return false;
    } finally {
      setIsArchiving(false);
    }
  };

  return {
    isArchiving,
    archiveCareRequest
  };
};
