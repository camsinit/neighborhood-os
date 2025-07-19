
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar, AlertTriangle, Construction, Eye, Edit, Trash } from "lucide-react";
import { format } from "date-fns";
import ShareButton from "@/components/ui/share-button";
import { useUser } from '@supabase/auth-helpers-react';
import { useState } from 'react';
import SafetyUpdateForm from './SafetyUpdateForm';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SafetyComments } from './SafetyComments';

/**
 * SafetySheetContent - Side panel component for displaying detailed safety update information
 * 
 * This component shows comprehensive details about a safety update including:
 * - Update details (title, description, type)
 * - Author information with avatar  
 * - Comments section with unified SafetyComments component
 * - Date information and sharing functionality
 */
interface SafetySheetContentProps {
  update: any; // Using any to match existing pattern - should be typed properly
  onOpenChange?: (open: boolean) => void;
}

const SafetySheetContent = ({ update, onOpenChange }: SafetySheetContentProps) => {
  const user = useUser();
  const queryClient = useQueryClient();
  const isAuthor = user?.id === update.author_id;
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Function to close the sheet
  const handleSheetClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  // Handle confirmed deletion
  const handleConfirmedDelete = async () => {
    setIsDeleting(true);
    
    try {
      // Close the sheet first
      handleSheetClose();
      
      // Add a small delay to ensure sheet animation completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { error } = await supabase
        .from('safety_updates')
        .delete()
        .eq('id', update.id);
        
      if (error) throw error;
      toast.success("Safety update deleted successfully");
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['safety-updates'] });
      
    } catch (error: any) {
      console.error('Error deleting safety update:', error);
      toast.error(`Failed to delete safety update: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Handle edit success
  const handleEditSuccess = () => {
    setIsEditing(false);
    // Refresh the data
    queryClient.invalidateQueries({ queryKey: ['safety-updates'] });
    toast.success("Safety update updated successfully");
  };

  // Helper function to get type styling and icon
  const getTypeStyles = (type: string) => {
    switch (type) {
      case "Alert":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          icon: AlertTriangle,
          border: "border-red-200"
        };
      case "Maintenance":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800", 
          icon: Construction,
          border: "border-yellow-200"
        };
      case "Observation":
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          icon: Eye,
          border: "border-blue-200"
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          icon: Eye,
          border: "border-gray-200"
        };
    }
  };

  const typeStyles = getTypeStyles(update.type);
  const IconComponent = typeStyles.icon;

  return (
    <>
    <SheetContent className="sm:max-w-md overflow-y-auto">
      <SheetHeader className="mb-4">
        <SheetTitle className="text-xl font-bold flex justify-between items-start">
          <span>{isEditing ? "Edit Safety Update" : update.title}</span>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <ShareButton
                contentType="safety"
                contentId={update.id}
                neighborhoodId={update.neighborhood_id}
                size="sm"
                variant="ghost"
              />
            )}
            {isAuthor && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-foreground"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            )}
          </div>
        </SheetTitle>
      </SheetHeader>

      {isEditing ? (
        <div className="space-y-4">
          <SafetyUpdateForm 
            onSuccess={handleEditSuccess}
            existingData={{
              title: update.title,
              description: update.description || '',
              type: update.type,
              imageUrl: update.imageUrl || ''
            }}
            updateId={update.id}
          />
          {/* Delete button in edit mode */}
          <div className="pt-4 border-t">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete Safety Update
            </Button>
          </div>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-6 pr-4">
            {/* Update Type Badge */}
            <div>
              <Badge className={`${typeStyles.bg} ${typeStyles.text} flex items-center gap-1 w-fit`}>
                <IconComponent className="w-3 h-3" />
                {update.type}
              </Badge>
            </div>

            {/* Author Information */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <Avatar className="h-12 w-12">
                <AvatarImage src={update.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {update.profiles?.display_name || 'Anonymous'}
                  {isAuthor && <span className="text-sm text-gray-500 font-normal"> (You)</span>}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(update.created_at), 'MMM d, yyyy \'at\' h:mm a')}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {update.description && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Details</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{update.description}</p>
              </div>
            )}

            {/* Image if available */}
            {update.imageUrl && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Image</h3>
                <img
                  src={update.imageUrl}
                  alt={update.title}
                  className="rounded-lg w-full max-h-64 object-cover"
                />
              </div>
            )}

            {/* Separator before comments */}
            <Separator className="my-6" />

            {/* Comments Section - Now using unified SafetyComments component */}
            <SafetyComments safetyUpdateId={update.id} />
          </div>
        </ScrollArea>
      )}
    </SheetContent>

    {/* Delete confirmation dialog */}
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this safety update. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirmedDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default SafetySheetContent;
