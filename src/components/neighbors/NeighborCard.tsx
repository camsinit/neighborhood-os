
import { UserWithRole } from "@/types/roles";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet } from "@/components/ui/sheet";
import { User, MapPin, Mail, Phone } from "lucide-react";
import NeighborSheetContent from "./NeighborSheetContent";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createItemNavigationService } from "@/services/navigation/ItemNavigationService";

interface NeighborCardProps {
  user: UserWithRole;
  onClick: (user: UserWithRole) => void; // Pass full user data
}

/**
 * NeighborCard Component
 * 
 * Displays a neighbor's basic information in a card format.
 * Updated to show contact icons when contact info is available instead of hardcoded email.
 */
export const NeighborCard = ({ user, onClick }: NeighborCardProps) => {
  const navigate = useNavigate();
  const handleCardClick = () => {
    // Use navigation service to open sheet via URL
    const navigationService = createItemNavigationService(navigate);
    navigationService.navigateToItem('neighbors', user.id, { 
      showToast: false 
    });
  };

  return (
    <Card 
      data-neighbor-id={user.id}
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col items-center space-y-3">
          {/* Avatar */}
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.profiles?.avatar_url || ''} />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="text-center space-y-1">
            <h3 className="font-medium text-base truncate max-w-[150px]">
              {user.profiles?.display_name || 'Neighbor'}
            </h3>
            
            {/* Show contact availability icons instead of hardcoded email */}
            <div className="flex justify-center gap-2 items-center">
              {user.profiles?.email_visible && user.profiles?.email && (
                <Mail className="h-3 w-3 text-gray-500" />
              )}
              {user.profiles?.phone_visible && user.profiles?.phone_number && (
                <Phone className="h-3 w-3 text-gray-500" />
              )}
              {user.profiles?.address_visible && user.profiles?.address && (
                <MapPin className="h-3 w-3 text-gray-500" />
              )}
            </div>

            {/* Show address if user has allowed it */}
            {user.profiles?.address_visible && user.profiles?.address && (
              <div className="flex items-center justify-center text-xs text-gray-600">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate max-w-[120px]">{user.profiles.address}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
