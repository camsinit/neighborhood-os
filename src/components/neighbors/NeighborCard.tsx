
import { UserWithRole } from "@/types/roles";
// Fix the import path for ModuleItemCard
import { ModuleItemCard } from "@/components/ui/card/ModuleItemCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MapPin, Phone, Mail } from "lucide-react";
import { highlightClassNames } from "@/utils/highlight/types";

interface NeighborCardProps {
  user: UserWithRole;
  onClick: () => void;
  isHighlighted?: boolean;
}

/**
 * NeighborCard Component
 * 
 * Displays a single neighbor's information in a card format with highlighting support.
 * Uses ModuleItemCard for consistent styling and highlight functionality.
 * 
 * @param user - The user data to display
 * @param onClick - Function to call when the card is clicked
 * @param isHighlighted - Whether this card should be highlighted
 */
export const NeighborCard = ({ user, onClick, isHighlighted = false }: NeighborCardProps) => {
  return (
    <ModuleItemCard 
      // Using proper data attributes for highlighting system
      itemId={user.id}
      itemType="neighbor"
      isHighlighted={isHighlighted}
      // Add styling with subtle hover effects
      className="transition-all duration-300 hover:shadow-md"
      // Pass click handler
      onClick={onClick}
    >
      <div className="flex flex-col items-center p-4 space-y-4">
        {/* Avatar - increased size for better visibility */}
        <Avatar className="h-20 w-20 border-2 border-purple-100">
          <AvatarImage src={user.profiles?.avatar_url || ''} />
          <AvatarFallback className="bg-purple-50">
            <User className="h-8 w-8 text-purple-400" />
          </AvatarFallback>
        </Avatar>

        {/* User Info with improved spacing and text styling */}
        <div className="text-center space-y-2 w-full">
          <h3 className="font-medium text-lg truncate max-w-[180px]">
            {user.profiles?.display_name || 'Neighbor'}
          </h3>
          
          {/* Contact information with icons for better visual hierarchy */}
          <div className="space-y-1.5 text-sm">
            {/* Always show email with icon */}
            <div className="flex items-center justify-center space-x-1 text-gray-600">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate max-w-[150px]">{user.email}</span>
            </div>
            
            {/* Phone number (visible only if allowed) */}
            {user.profiles?.phone_visible && user.profiles?.phone_number && (
              <div className="flex items-center justify-center space-x-1 text-gray-600">
                <Phone className="h-3.5 w-3.5" />
                <span>{user.profiles.phone_number}</span>
              </div>
            )}

            {/* Only show address if user has allowed it */}
            {user.profiles?.address_visible && user.profiles?.address && (
              <div className="flex items-center justify-center space-x-1 text-gray-600">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate max-w-[150px]">{user.profiles.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModuleItemCard>
  );
};
