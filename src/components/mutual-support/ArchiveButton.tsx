
// This component will be shared between CarePage and GoodsPage
import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

interface ArchiveButtonProps {
  requestId: string;
  tableName: "care_requests" | "goods_exchange";
  onArchiveComplete?: () => void;
}

const ArchiveButton = ({ requestId, tableName, onArchiveComplete }: ArchiveButtonProps) => {
  const [isArchiving, setIsArchiving] = useState(false);
  const user = useUser();

  // Function to archive a request
  const handleArchive = async () => {
    if (!user) return;
    
    setIsArchiving(true);
    try {
      const { error } = await supabase
        .from(tableName)
        .update({
          archived_at: new Date().toISOString(),
          archived_by: user.id,
          is_archived: true
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Request archived successfully');
      if (onArchiveComplete) {
        onArchiveComplete();
      }
    } catch (error) {
      console.error('Error archiving request:', error);
      toast.error('Failed to archive request');
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation(); // Prevent triggering parent click handlers
        handleArchive();
      }}
      disabled={isArchiving}
    >
      <Archive className="h-4 w-4 mr-2" />
      {isArchiving ? 'Archiving...' : 'Archive'}
    </Button>
  );
};

export default ArchiveButton;
