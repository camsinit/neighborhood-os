import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar, AlertTriangle, Construction, Eye, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import ShareButton from "@/components/ui/share-button";
import { useUser } from '@supabase/auth-helpers-react';
import { useState } from 'react';

/**
 * SafetySheetContent - Side panel component for displaying detailed safety update information
 * 
 * This component shows comprehensive details about a safety update including:
 * - Update details (title, description, type)
 * - Author information with avatar  
 * - Comments section and interaction options
 * - Date information and sharing functionality
 */
interface SafetySheetContentProps {
  update: any; // Using any to match existing pattern - should be typed properly
  onOpenChange?: (open: boolean) => void;
}

const SafetySheetContent = ({ update, onOpenChange }: SafetySheetContentProps) => {
  const user = useUser();
  const isAuthor = user?.id === update.author_id;
  const [showComments, setShowComments] = useState(false);

  // Function to close the sheet
  const handleSheetClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
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
    <SheetContent className="sm:max-w-md overflow-y-auto">
      <SheetHeader className="mb-4">
        <SheetTitle className="text-xl font-bold flex justify-between items-start">
          <span>{update.title}</span>
          <div className="flex items-center gap-2">
            <ShareButton
              contentType="safety"
              contentId={update.id}
              neighborhoodId={update.neighborhood_id}
              size="sm"
              variant="ghost"
            />
          </div>
        </SheetTitle>
      </SheetHeader>

      <div className="space-y-6">
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

        {/* Action Buttons */}
        <div className="space-y-3 pt-4 border-t">
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="h-4 w-4" />
            {showComments ? 'Hide Comments' : 'View Comments'}
          </Button>

          {!isAuthor && (
            <Button className="w-full flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Add Comment
            </Button>
          )}
        </div>

        {/* Comments Section - Placeholder for future implementation */}
        {showComments && (
          <div className="pt-4 border-t">
            <h3 className="font-semibold text-lg mb-3">Comments</h3>
            <div className="text-gray-500 text-center py-4">
              Comments feature coming soon
            </div>
          </div>
        )}
      </div>
    </SheetContent>
  );
};

export default SafetySheetContent;