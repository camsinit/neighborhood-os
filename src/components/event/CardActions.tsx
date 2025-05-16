
/**
 * CardActions component for event cards
 * 
 * This component:
 * - Displays an edit button for event hosts
 * - Handles event deletion
 */
import { Pencil } from "lucide-react";
import EditEventDialog from "./EditEventDialog";
import { Event } from "@/types/localTypes";

interface CardActionsProps {
  event: Event;
  isHost: boolean;
  onDelete?: () => void;
  onSheetClose?: () => void;
}

const CardActions = ({ event, isHost, onDelete, onSheetClose }: CardActionsProps) => {
  if (!isHost) return null;
  
  // Handle event deletion
  const handleDelete = () => {
    // Add a small delay before calling onDelete to ensure sheet animations complete
    setTimeout(() => {
      // Call the onDelete callback if provided
      if (onDelete) onDelete();
    }, 200);
    
    // Close the sheet if provided
    if (onSheetClose) onSheetClose();
  };

  return (
    <EditEventDialog 
      event={event} 
      onDelete={handleDelete}
      onSheetClose={onSheetClose}
    >
      <div className="flex items-center gap-2 text-blue-600">
        <Pencil className="h-4 w-4" />
        Edit
      </div>
    </EditEventDialog>
  );
};

export default CardActions;
