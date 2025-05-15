
/**
 * SafetyUpdateDetail.tsx
 * 
 * Component for displaying the detailed view of a safety update
 * Shows the full content, author information, and comments
 */
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useUser } from "@supabase/auth-helpers-react";
import EditSafetyUpdateDialog from "../EditSafetyUpdateDialog";
import { SafetyUpdateComments } from "../SafetyUpdateComments";

// Props for the SafetyUpdateDetail component
interface SafetyUpdateDetailProps {
  update: any;
  onDelete: (updateId: string) => void;
}

/**
 * Displays the detail view of a safety update within a dialog
 * Shows author info, content, and provides edit/delete options for owners
 */
const SafetyUpdateDetail = ({ update, onDelete }: SafetyUpdateDetailProps) => {
  // Get current user for permission checks
  const user = useUser();
  
  // Only show edit/delete buttons if the user is the author
  const isUserAuthor = user && user.id === update?.author_id;
  
  return (
    <div className="space-y-6">
      {/* Author information with avatar */}
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10 rounded-full">
          <AvatarImage 
            src={update?.profiles?.avatar_url || ''} 
            alt={update?.profiles?.display_name || 'User'} 
            className="rounded-full"
          />
          <AvatarFallback className="rounded-full">
            <User className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{update?.profiles?.display_name}</p>
          <p className="text-sm text-muted-foreground">
            {update?.created_at && format(new Date(update.created_at), 'MMM d, yyyy')}
          </p>
        </div>
      </div>
      
      {/* Update description */}
      <p className="text-gray-700">{update?.description}</p>
      
      {/* Edit and Delete buttons for the author */}
      {isUserAuthor && (
        <div className="flex items-center gap-2">
          <EditSafetyUpdateDialog update={update}>
            <Button 
              variant="ghost" 
              size="sm"
              className="hover:bg-secondary rounded-md"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </EditSafetyUpdateDialog>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(update.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      )}
      
      {/* Comments section */}
      <SafetyUpdateComments updateId={update.id} />
    </div>
  );
};

export default SafetyUpdateDetail;
