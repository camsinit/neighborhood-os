
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

interface SupportRequestDialogProps {
  request: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SupportRequestDialog = ({ request, open, onOpenChange }: SupportRequestDialogProps) => {
  const user = useUser();

  // Add delete handler function
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('skills_exchange')
        .delete()
        .eq('id', request?.id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      toast.success("Skill request deleted successfully");
      onOpenChange(false); // Close the dialog
      window.location.reload(); // Refresh the page to update the list
    } catch (error) {
      console.error('Error deleting skill request:', error);
      toast.error("Failed to delete skill request");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{request?.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
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
          <p className="text-gray-700">{request?.description}</p>
          {request?.image_url && request?.type === 'goods' && (
            <img 
              src={request.image_url} 
              alt={request.title}
              className="w-full max-h-96 object-cover rounded-md"
            />
          )}
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
