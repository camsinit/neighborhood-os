
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Pencil, Trash2, Clock, Calendar, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import EditSupportRequestDialog from "./EditSupportRequestDialog";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { GoodsExchangeItem, SkillExchangeItem } from "@/types/localTypes";
import { GoodsRequestUrgency } from '../support/types/formTypes';
import { useState } from "react";

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
 * Image Carousel Component
 * 
 * This component displays a carousel of images with navigation controls
 * It allows users to scroll through multiple images for a support request
 */
const ImageCarousel = ({ images }: { images: string[] }) => {
  // State to track the current image index being shown
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Don't render anything if there are no images
  if (!images || images.length === 0) return null;
  
  // Function to go to the next image
  const nextImage = () => {
    // If we're at the last image, go back to the first one (loop around)
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  // Function to go to the previous image
  const prevImage = () => {
    // If we're at the first image, go to the last one (loop around)
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  
  return (
    <div className="relative">
      {/* The image container with rounded corners */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
        <img 
          src={images[currentIndex]} 
          alt={`Image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>
      
      {/* Only show navigation controls if there's more than one image */}
      {images.length > 1 && (
        <div className="absolute inset-0 flex items-center justify-between">
          {/* Previous button */}
          <Button 
            onClick={prevImage} 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 rounded-full bg-black/30 text-white hover:bg-black/50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {/* Next button */}
          <Button 
            onClick={nextImage} 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 rounded-full bg-black/30 text-white hover:bg-black/50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Image counter/indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center">
          <div className="bg-black/50 text-white text-xs rounded-full px-2 py-1">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
};

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
  
  /**
   * Create a contact email link for the "I Can Help" button
   * This formats the email with a helpful subject and body text
   */
  const createContactEmailLink = () => {
    // If no request or no profile, return a basic mailto link
    if (!request || !request.profiles) {
      return "mailto:?subject=About your item on Neighborhood App";
    }
    
    // Get display name and item details
    const posterName = request.profiles.display_name || "Neighbor";
    const itemTitle = request.title || "your posted item";
    
    // Create a well-formatted email subject
    const subject = encodeURIComponent(`About your item: ${itemTitle}`);
    
    // Create a helpful email body with greeting and context
    const body = encodeURIComponent(
      `Hi ${posterName},\n\nI saw your post for "${itemTitle}" on our neighborhood app and I'd like to help. `+
      `\n\nLet me know when would be a good time to connect about this.\n\nThanks!`
    );
    
    // Use the poster's email if available, otherwise leave blank
    const email = request.profiles.email || "";
    
    // Return the formatted mailto link
    return `mailto:${email}?subject=${subject}&body=${body}`;
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
          {/* User info section with Edit button moved here */}
          <div className="flex items-center justify-between gap-4 border-b pb-4">
            <div className="flex items-center gap-4">
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
            </div>
            
            {/* Edit button moved here */}
            {user && user.id === request?.user_id && (
              <div className="flex items-center">
                <EditSupportRequestDialog request={request}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="hover:bg-secondary"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </EditSupportRequestDialog>
              </div>
            )}
            
            {/* Add urgency badge for goods items with urgency */}
            {request.urgency && (
              <span className={`ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                getUrgencyClass(request.urgency as GoodsRequestUrgency)
              }`}>
                {getUrgencyLabel(request.urgency as GoodsRequestUrgency)}
              </span>
            )}
          </div>
          
          {/* Split into two columns: Image gallery on left, details on right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left column: Image carousel - only show if images exist */}
            <div className={`${images.length === 0 ? 'hidden' : ''}`}>
              {images.length > 0 && (
                <ImageCarousel images={images} />
              )}
            </div>
            
            {/* Right column: Description card with improved styling */}
            <div className={`${images.length === 0 ? 'col-span-2' : ''}`}>
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
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-between items-center">
            {/* Only show delete button to the item owner - Edit button was moved up */}
            {user && user.id === request?.user_id && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            
            {/* Email Contact button - modified to open email client */}
            <a 
              href={createContactEmailLink()} 
              className="ml-auto" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button>
                {request?.request_type === 'need' ? "I Can Help" : "I'm Interested"}
              </Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportRequestDialog;
