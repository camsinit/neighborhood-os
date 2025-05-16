
/**
 * SafetyUpdateDetail.tsx
 * 
 * Component for displaying the detailed view of a community update
 * Shows the full content, author information, and comments
 */
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Construction, Info, Wrench, User, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useUser } from "@supabase/auth-helpers-react";
import EditSafetyUpdateDialog from "../EditSafetyUpdateDialog";
import { SafetyUpdateComments } from "../SafetyUpdateComments";
import { cn } from "@/lib/utils";

// Props for the SafetyUpdateDetail component
interface SafetyUpdateDetailProps {
  update: any;
  onDelete: (updateId: string) => void;
}

/**
 * Displays the detail view of a community update within a dialog
 * Shows author info, content, and provides edit/delete options for owners
 */
const SafetyUpdateDetail = ({ update, onDelete }: SafetyUpdateDetailProps) => {
  // Get current user for permission checks
  const user = useUser();
  
  // Only show edit/delete buttons if the user is the author
  const isUserAuthor = user && user.id === update?.author_id;
  
  // Helper function to get tag color and icon based on type
  const getTypeStyles = (type: string) => {
    switch (type) {
      case "Emergency":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          icon: AlertTriangle,
          border: "border-red-200"
        };
      case "Alert":
        return {
          bg: "bg-orange-50",
          text: "text-orange-700",
          icon: AlertTriangle,
          border: "border-orange-200"
        };
      case "Maintenance":
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-700",
          icon: Wrench,
          border: "border-yellow-200"
        };
      case "Infrastructure":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          icon: Construction,
          border: "border-blue-200"
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          icon: Info,
          border: "border-gray-200"
        };
    }
  };
  
  const typeStyles = getTypeStyles(update?.type);
  const TypeIcon = typeStyles.icon;
  
  return (
    <div className="space-y-6">
      {/* Type badge - new! */}
      <div className={cn("inline-flex items-center px-3 py-1 rounded-md text-sm", typeStyles.bg, typeStyles.text, typeStyles.border)}>
        <TypeIcon className="h-4 w-4 mr-2" />
        <span className="font-medium">{update?.type}</span>
      </div>
      
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
      
      {/* Update title - new! */}
      <h3 className="text-xl font-semibold text-gray-900">
        {update?.title}
      </h3>
      
      {/* Update description */}
      <div className="text-gray-700 prose prose-sm max-w-none">
        {update?.description?.split('\n').map((paragraph: string, i: number) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
      
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
