import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, MapPin, Mail, Phone, Calendar, MessageSquare, Star } from "lucide-react";
import { format } from "date-fns";
import { UserWithRole } from "@/types/roles";
import { useUser } from '@supabase/auth-helpers-react';

/**
 * NeighborSheetContent - Side panel component for displaying detailed neighbor profile information
 * 
 * This component shows comprehensive details about a neighbor including:
 * - Profile information (name, avatar, bio)
 * - Contact information (respecting privacy settings)
 * - Address information (if shared)
 * - Skills and interests
 * - Community activity and join date
 */
interface NeighborSheetContentProps {
  neighbor: UserWithRole;
  onOpenChange?: (open: boolean) => void;
}

const NeighborSheetContent = ({ neighbor, onOpenChange }: NeighborSheetContentProps) => {
  const currentUser = useUser();
  const isCurrentUser = currentUser?.id === neighbor.id;

  // Function to close the sheet
  const handleSheetClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <SheetContent className="sm:max-w-md overflow-y-auto">
      <SheetHeader className="mb-4">
        <SheetTitle className="text-xl font-bold flex justify-between items-start">
          <span>{neighbor.profiles?.display_name || 'Neighbor'}</span>
          <div className="flex items-center gap-2">
            {/* Share functionality could be added here if needed */}
          </div>
        </SheetTitle>
      </SheetHeader>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="flex flex-col items-center space-y-4 p-4 rounded-lg bg-gray-50">
          <Avatar className="h-24 w-24">
            <AvatarImage src={neighbor.profiles?.avatar_url || ''} />
            <AvatarFallback className="text-2xl">
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">
              {neighbor.profiles?.display_name || 'Neighbor'}
              {isCurrentUser && <span className="text-sm text-gray-500 font-normal"> (You)</span>}
            </h3>
            
            {/* Join Date */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Joined {format(new Date(neighbor.created_at || new Date()), 'MMM yyyy')}</span>
            </div>

            {/* Years lived here */}
            {neighbor.profiles?.years_lived_here && (
              <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                📍 {neighbor.profiles.years_lived_here} {neighbor.profiles.years_lived_here === 1 ? 'year' : 'years'} in the area
              </div>
            )}
          </div>
        </div>

        {/* Bio Section */}
        {neighbor.profiles?.bio && (
          <div>
            <h3 className="font-semibold text-lg mb-2">About</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{neighbor.profiles.bio}</p>
          </div>
        )}

        {/* Contact Information */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Contact Information</h3>
          <div className="space-y-2">
            {neighbor.profiles?.email_visible && neighbor.profiles?.email && (
              <div className="flex items-center gap-3 p-2 rounded bg-gray-50">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{neighbor.profiles.email}</span>
              </div>
            )}
            
            {neighbor.profiles?.phone_visible && neighbor.profiles?.phone_number && (
              <div className="flex items-center gap-3 p-2 rounded bg-gray-50">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{neighbor.profiles.phone_number}</span>
              </div>
            )}
            
            {neighbor.profiles?.address_visible && neighbor.profiles?.address && (
              <div className="flex items-center gap-3 p-2 rounded bg-gray-50">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{neighbor.profiles.address}</span>
              </div>
            )}
            
            {!neighbor.profiles?.email_visible && !neighbor.profiles?.phone_visible && !neighbor.profiles?.address_visible && (
              <p className="text-gray-500 text-sm italic">Contact information not shared</p>
            )}
          </div>
        </div>

        {/* Skills Section - Commented out since skills field doesn't exist in current type */}
        {/* Future enhancement: Add skills display when available in profile data */}

        {/* Access Needs */}
        {neighbor.profiles?.access_needs && (
          <div>
            <h3 className="font-semibold text-lg mb-2">Accessibility Notes</h3>
            <p className="text-gray-600 text-sm">{neighbor.profiles.access_needs}</p>
          </div>
        )}

        {/* Action Buttons */}
        {!isCurrentUser && (
          <div className="space-y-3 pt-4 border-t">
            <Button className="w-full flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Send Message
            </Button>
            
            {(neighbor.profiles?.email_visible || neighbor.profiles?.phone_visible) && (
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Star className="h-4 w-4" />
                Add to Favorites
              </Button>
            )}
          </div>
        )}

        {isCurrentUser && (
          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full">
              Edit Profile
            </Button>
          </div>
        )}
      </div>
    </SheetContent>
  );
};

export default NeighborSheetContent;