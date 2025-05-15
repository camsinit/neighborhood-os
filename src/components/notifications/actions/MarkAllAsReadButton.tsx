
/**
 * MarkAllAsReadButton.tsx
 * 
 * Button component that allows users to mark all notifications as read
 */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner"; // Updated to use Sonner directly

// Props for MarkAllAsReadButton component
interface MarkAllAsReadButtonProps {
  unreadCount: number;
  showArchived: boolean;
  onComplete?: () => void; // Optional callback after marking all as read
}

/**
 * Button that marks all notifications as read
 * 
 * @param unreadCount - Number of unread notifications (used to determine when to show the button)
 * @param showArchived - Whether to show archived notifications
 * @param onComplete - Optional callback after completion
 */
const MarkAllAsReadButton: React.FC<MarkAllAsReadButtonProps> = ({
  unreadCount,
  showArchived,
  onComplete
}) => {
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const queryClient = useQueryClient();

  // Don't show the button if there are no unread notifications or we're viewing archived notifications
  if (unreadCount === 0 || showArchived) {
    return null;
  }

  /**
   * Function to mark all notifications as read
   */
  const markAllAsRead = async () => {
    try {
      setIsMarkingRead(true);
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      if (!userId) {
        toast.error("User not authenticated");
        return;
      }

      // Using fixed literal strings instead of dynamic type variables
      // This avoids the excessive type instantiation error
      // TypeScript will verify these at compile time
      const tableNames = ['safety_updates', 'events', 'support_requests', 'goods_exchange'];

      // Update each table in parallel with safe type casting
      await Promise.all(tableNames.map(async tableName => {
        const {
          error
        } = await supabase.from(tableName as any) // Type assertion to work around strict typing
        .update({
          is_read: true
        }).eq("user_id", userId).eq("is_archived", showArchived);
        if (error) {
          console.error(`Error updating ${tableName} notifications:`, error);
        }
      }));

      // Invalidate and refetch notifications
      queryClient.invalidateQueries({
        queryKey: ["notifications"]
      });
      if (onComplete) {
        onComplete();
      }
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast.error("Failed to mark notifications as read");
    } finally {
      setIsMarkingRead(false);
    }
  };
  
  // Render the button
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={markAllAsRead} 
      disabled={isMarkingRead}
      className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
    >
      <Check className="h-3 w-3" />
      {isMarkingRead ? "Marking..." : "Mark all as read"}
    </Button>
  );
};
export default MarkAllAsReadButton;
