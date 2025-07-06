
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet } from "@/components/ui/sheet";
import { AlertTriangle, Construction, Eye, User } from "lucide-react";
import { format } from "date-fns";
import { generateDataAttributes } from "@/utils/dataAttributes";
import ShareButton from "@/components/ui/share-button";
import SafetySheetContent from "./SafetySheetContent";
import { useState } from "react";

interface SafetyUpdateCardProps {
  update: any;
  onClick: () => void;
}

const SafetyUpdateCard = ({
  update,
  onClick
}: SafetyUpdateCardProps) => {
  // Add state to track hover for share button and sheet
  const [isHovering, setIsHovering] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  // Helper function to get tag color based on type
  const getTypeStyles = (type: string) => {
    switch (type) {
      case "Alert":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          icon: AlertTriangle,
          border: "border-red-200"
        };
      case "Maintenance":
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-700",
          icon: Construction,
          border: "border-yellow-200"
        };
      case "Observation":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          icon: Eye,
          border: "border-blue-200"
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          icon: Eye,
          border: "border-gray-200"
        };
    }
  };

  const typeStyles = getTypeStyles(update.type);
  const IconComponent = typeStyles.icon;
  
  // Generate data attributes for highlighting and navigation
  const dataAttributes = generateDataAttributes('safety', update.id);

  const handleCardClick = () => {
    setIsSheetOpen(true);
    if (onClick) onClick();
  };

  return (
    <>
      <Card 
        className={`p-4 cursor-pointer hover:shadow-md transition-all duration-300 border-l-4 relative ${typeStyles.border}`} 
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        {...dataAttributes} // Apply data attributes for highlighting
      >
      {/* Share button in top right corner - shows on hover */}
      {isHovering && (
        <div className="absolute top-2 right-2 z-10">
          <ShareButton
            contentType="safety"
            contentId={update.id}
            neighborhoodId={update.neighborhood_id}
            className="bg-white hover:bg-gray-50"
          />
        </div>
      )}

      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={update.profiles?.avatar_url} alt={update.profiles?.display_name || 'User'} />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {update.title}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeStyles.bg} ${typeStyles.text}`}>
                <IconComponent className="w-3 h-3 mr-1" />
                {update.type}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {format(new Date(update.created_at), 'MMM d')}
            </span>
          </div>

          <p className="text-sm text-gray-500 line-clamp-2 mb-2">
            {update.description}
          </p>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            
          </div>
        </div>
      </div>

      {update.imageUrl && (
        <div className="mt-3">
          <img src={update.imageUrl} alt={update.title} className="rounded-lg w-full h-48 object-cover" />
        </div>
      )}
    </Card>

    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SafetySheetContent update={update} onOpenChange={setIsSheetOpen} />
    </Sheet>
  </>
  );
};

export default SafetyUpdateCard;
