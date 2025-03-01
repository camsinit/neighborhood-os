
import { useState } from 'react';
import { Archive } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * ArchiveButton component
 * 
 * This component provides a UI element to archive/mark as completed various types of items
 * like goods, skills, or care requests. 
 * 
 * @param requestId - The ID of the item to archive
 * @param tableName - The database table where the item is stored
 * @param onArchiveComplete - Callback function to run after successful archiving
 */
interface ArchiveButtonProps {
  requestId: string;
  tableName: string;
  onArchiveComplete?: () => void;
}

const ArchiveButton = ({ 
  requestId, 
  tableName,
  onArchiveComplete 
}: ArchiveButtonProps) => {
  // State to track loading status during archiving operation
  const [isArchiving, setIsArchiving] = useState(false);
  
  /**
   * Handles the archive action
   * Updates the database to mark the item as archived and records who archived it
   */
  const handleArchive = async (e: React.MouseEvent) => {
    // Prevent event bubbling to parent elements
    e.stopPropagation();
    
    try {
      // Start loading state
      setIsArchiving(true);
      
      // Get the current authenticated user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to archive items");
        setIsArchiving(false);
        return;
      }
      
      // Log the archive attempt for debugging
      console.log(`Attempting to archive ${tableName} item ${requestId} by user ${user.id}`);
      
      // Create the update data object with archived details
      const updateData = {
        is_archived: true,
        archived_at: new Date().toISOString(),
        archived_by: user.id
      };
      
      // Update the database record
      const { data, error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', requestId);
        
      // Handle any errors
      if (error) {
        console.error("Error archiving request:", error);
        toast.error("Failed to archive the item");
        throw error;
      }
      
      // Show success message
      toast.success("Item archived successfully");
      
      // Call the optional callback function if provided
      if (onArchiveComplete) {
        onArchiveComplete();
      }
    } catch (error) {
      // Log and display any errors that occur
      console.error("Error archiving request:", error);
      toast.error("Failed to archive the item");
    } finally {
      // Always reset loading state
      setIsArchiving(false);
    }
  };
  
  // Render a small archive button
  return (
    <Button
      size="icon"
      variant="ghost"
      className="h-8 w-8 rounded-full"
      onClick={handleArchive}
      disabled={isArchiving}
      title="Archive this item"
    >
      <Archive className="h-4 w-4" />
    </Button>
  );
};

export default ArchiveButton;
