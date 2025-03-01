
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Pencil, Trash2, Clock, Calendar, Tag } from "lucide-react";
import { format } from "date-fns";
import EditSupportRequestDialog from "./EditSupportRequestDialog";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { GoodsExchangeItem, SkillExchangeItem } from "@/types/localTypes";
import { GoodsRequestUrgency } from '../support/types/formTypes';

// Interface defining the props for the SupportRequestDialog component
interface SupportRequestDialogProps {
  // The request object can be any type (goods, skills, etc.)
  request: any;
  // Controls whether the dialog is visible
  open: boolean;
  // Function to handle opening/closing the dialog
  onOpenChange: (open: boolean) => void;
}

/**
 * SupportRequestDialog Component
 * 
 * This component displays detailed information about a support request (goods, skills, etc.)
 * in a modal dialog. It includes user information, request details, and action buttons.
 * 
 * The layout is now enhanced with better visual hierarchy and improved image display.
 */
const SupportRequestDialog = ({ request, open, onOpenChange }: SupportRequestDialogProps) => {
  // Get the current authenticated user
  const user = useUser();

  // Helper function to get urgency styling class
  const getUrgencyClass = (urgency?: GoodsRequestUrgency) => {
    if (!urgency) return "bg-gray-100 text-gray-800";
    
    switch(urgency) {
      case 'critical':
        return "bg-red-100 text-red-800";
      case 'high':
        return "bg-orange-100 text-orange-800";
      case 'medium':
        return "bg-yellow-100 text-yellow-800";
      case 'low':
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper function to get a human-readable urgency label
  const getUrgencyLabel = (urgency?: GoodsRequestUrgency) => {
    if (!urgency) return "Normal";
    
    switch(urgency) {
      case 'critical':
        return "Critical";
      case 'high':
        return "High";
      case 'medium':
        return "Medium";
      case 'low':
        return "Low";
      default:
        return "Normal";
    }
  };

  /**
   * Handle the deletion of a request
   * Makes an API call to delete the item from the database
   */
  const handleDelete = async () => {
    try {
      // Define a type for the valid table names to ensure type safety
      type ValidTableName = "goods_exchange" | "skills_exchange" | "support_requests";
      
      // Determine which table to delete from based on the request type
      // Instead of using a string variable, we'll determine the table directly
      let tableName: ValidTableName;
      
      if (request?.category === 'goods') {
        tableName = "goods_exchange";
      } else if (request?.skill_category) {
        tableName = "skills_exchange";
      } else {
        tableName = "support_requests"; // Default fallback
      }
      
      // Make the delete request to Supabase with the explicitly typed table name
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', request?.id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      // Show a success message
      toast.success("Item deleted successfully");
      onOpenChange(false); // Close the dialog
      
      // Refresh the page to update the data display
      window.location.reload();
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error("Failed to delete the item");
    }
  };

  // If there's no request, render nothing
  if (!request) return null;

  // Get images array from the request - handle both single and multiple images
  const images = request.images || (request.image_url ? [request.image_url] : []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] overflow-y-auto max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">{request?.title}</DialogTitle>
        </DialogHeader>
        
        {/* Main content area */}
        <div className="space-y-6">
          {/* User info section */}
          <div className="flex items-center gap-4 border-b pb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={request?.profiles?.avatar_url || ''} 
                alt={request?.profiles?.display_name || 'User'} 
              />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-base">{request?.profiles?.display_name || 'Anonymous'}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {request?.created_at && format(new Date(request.created_at), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
            
            {/* Add urgency badge for goods items with urgency */}
            {request.urgency && (
              <span className={`ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                getUrgencyClass(request.urgency as GoodsRequestUrgency)
              }`}>
                {getUrgencyLabel(request.urgency as GoodsRequestUrgency)}
              </span>
            )}
          </div>
          
          {/* Image gallery - only show if images exist */}
          {images.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Images</h3>
              <div className={`grid ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                {images.map((imgUrl: string, index: number) => (
                  <div 
                    key={index}
                    className="relative bg-gray-100 rounded-md overflow-hidden"
                  >
                    <img 
                      src={imgUrl} 
                      alt={`${request.title} - Image ${index + 1}`}
                      className="w-full h-48 object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Description card with improved styling */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{request?.description}</p>
              
              {/* Item details section for additional metadata */}
              <div className="mt-4 space-y-2">
                {/* Item type badge */}
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {request.request_type === 'need' 
                      ? 'Request' 
                      : request.request_type === 'offer' 
                        ? 'Offer' 
                        : 'Item'
                    }
                    
                    {/* Show category if available */}
                    {request.goods_category && ` • ${request.goods_category}`}
                    {request.skill_category && ` • ${request.skill_category}`}
                  </span>
                </div>
                
                {/* Valid until date if available */}
                {request.valid_until && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Valid until {format(new Date(request.valid_until), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Action buttons */}
          <div className="flex justify-between items-center">
            {/* Only show edit/delete buttons to the item owner */}
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
            
            {/* Action button changes based on request type */}
            <Button className="ml-auto">
              {request?.request_type === 'need' ? "I Can Help" : "I'm Interested"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportRequestDialog;
