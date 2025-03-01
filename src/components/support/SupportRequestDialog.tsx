
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import EditSupportRequestDialog from "./EditSupportRequestDialog";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Dialog to display details of a support request
 * 
 * Shows full information about the selected request including:
 * - Title and description
 * - User profile information
 * - Created date
 * - Images (if any)
 * 
 * Also includes edit and delete options for the request owner
 */
interface SupportRequestDialogProps {
  request: any;  // The request object to display
  open: boolean;  // Whether the dialog is open
  onOpenChange: (open: boolean) => void;  // Handler for dialog open/close
}

const SupportRequestDialog = ({ request, open, onOpenChange }: SupportRequestDialogProps) => {
  // Get current user to determine if they can edit/delete
  const user = useUser();

  // Handle delete action
  const handleDelete = async () => {
    try {
      // Determine which table to delete from based on the request type
      const tableName = request?.category === 'skills' ? 'skills_exchange' : 'goods_exchange';
      
      // Delete the request from the appropriate table
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', request?.id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      // Show success message and close dialog
      toast.success(`${request?.category === 'skills' ? 'Skill' : 'Item'} deleted successfully`);
      onOpenChange(false); // Close the dialog
      
      // Dispatch event to refresh the list
      const eventName = request?.category === 'skills' ? 'skills-request-updated' : 'goods-request-updated';
      document.dispatchEvent(new Event(eventName));
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error("Failed to delete request");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{request?.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* User profile information */}
          <div className="flex items-center gap-4">
            <Avatar className="h-6 w-6">
              <AvatarImage 
                src={request?.profiles?.avatar_url || ''} 
                alt={request?.profiles?.display_name || 'User'} 
              />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{request?.profiles?.display_name}</p>
              <p className="text-sm text-muted-foreground">
                {request?.created_at && format(new Date(request.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-gray-700">{request?.description}</p>
          
          {/* Image (if available) */}
          {request?.image_url && (
            <img 
              src={request.image_url} 
              alt={request.title}
              className="w-full max-h-96 object-cover rounded-md"
            />
          )}
          
          {/* Multiple images (if available) */}
          {request?.images && request.images.length > 0 && !request?.image_url && (
            <div className="grid grid-cols-2 gap-2">
              {request.images.slice(0, 4).map((img: string, i: number) => (
                <img 
                  key={i}
                  src={img} 
                  alt={`${request.title} - image ${i+1}`}
                  className="w-full h-40 object-cover rounded-md"
                />
              ))}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex justify-between items-center">
            {user && user.id === request?.user_id && (
              <div className="flex gap-2">
                <EditSupportRequestDialog request={request}>
                  <Button 
                    variant="outline" 
                    size="sm"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </EditSupportRequestDialog>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
            <Button className="ml-auto">
              {request?.request_type === 'need' ? "I can help" : "I'm Interested"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportRequestDialog;
