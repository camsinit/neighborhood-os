
/**
 * SafetyUpdateCard.tsx
 * 
 * Card component for displaying safety updates
 */
import React from "react";
// Import directly from the source file to avoid circular dependencies
import ModuleItemCard from "@/components/ui/card/ModuleItemCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle, Construction, Eye, User } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Props interface
interface SafetyUpdateCardProps {
  update: any;
  onClick: () => void;
}

/**
 * SafetyUpdateCard - Displays a safety update using our unified design system
 * 
 * This component showcases our new card system with proper data attributes
 * and consistent styling.
 */
const SafetyUpdateCard = ({
  update,
  onClick
}: SafetyUpdateCardProps) => {
  // Helper function to get tag color based on type
  const getTypeStyles = (type: string) => {
    switch (type) {
      case "Alert":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          icon: AlertTriangle,
          border: "border-red-200",
          accentColor: "#EF4444"
        };
      case "Maintenance":
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-700",
          icon: Construction,
          border: "border-yellow-200",
          accentColor: "#F59E0B"
        };
      case "Observation":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          icon: Eye,
          border: "border-blue-200",
          accentColor: "#3B82F6"
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          icon: Eye,
          border: "border-gray-200",
          accentColor: "#6B7280"
        };
    }
  };
  
  const typeStyles = getTypeStyles(update.type);
  const IconComponent = typeStyles.icon;
  
  return (
    <ModuleItemCard
      itemType="safety"
      itemId={update.id}
      className="p-4 rounded-lg"
      accentColor={typeStyles.accentColor}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* User avatar with fallback */}
        <Avatar className="h-10 w-10 rounded-full">
          <AvatarImage src={update.profiles?.avatar_url} alt={update.profiles?.display_name || 'User'} className="rounded-full" />
          <AvatarFallback className="rounded-full">
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {/* Header with title, tag, and date */}
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {update.title}
              </h3>
              <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", typeStyles.bg, typeStyles.text)}>
                <IconComponent className="w-3 h-3 mr-1" />
                {update.type}
              </span>
            </div>
            {/* Date indicator */}
            <span className="text-xs text-gray-500">
              {format(new Date(update.created_at), 'MMM d')}
            </span>
          </div>

          {/* Description with line clamp */}
          <p className="text-sm text-gray-500 truncate-2 mb-2">
            {update.description}
          </p>
        </div>
      </div>

      {/* Show image if available */}
      {update.imageUrl && (
        <div className="mt-3">
          <img 
            src={update.imageUrl} 
            alt={update.title} 
            className="rounded-lg w-full h-48 object-cover" 
          />
        </div>
      )}
    </ModuleItemCard>
  );
};

export default SafetyUpdateCard;
