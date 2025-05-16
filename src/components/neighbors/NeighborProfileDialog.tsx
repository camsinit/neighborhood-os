
import { UserWithRole } from "@/types/roles";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MapPin, Phone, Mail, Calendar } from "lucide-react";
import { format } from 'date-fns';
import { Separator } from "@/components/ui/separator";

interface NeighborProfileDialogProps {
  user: UserWithRole | null;
  onClose: () => void;
}

/**
 * NeighborProfileDialog Component
 * 
 * Shows detailed information about a neighbor in a dialog.
 * Includes name, contact info, and other profile details.
 * 
 * @param user - The user to display details for
 * @param onClose - Function to call when dialog is closed
 */
export const NeighborProfileDialog = ({ user, onClose }: NeighborProfileDialogProps) => {
  if (!user) return null;

  // Format created_at date if available
  const memberSince = user.created_at 
    ? format(new Date(user.created_at), 'MMMM yyyy')
    : 'Unknown date';

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">Neighbor Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header - Enhanced with better spacing and layout */}
          <div className="flex items-center space-x-5">
            <Avatar className="h-24 w-24 border-2 border-purple-100">
              <AvatarImage src={user.profiles?.avatar_url || ''} />
              <AvatarFallback className="bg-purple-50">
                <User className="h-10 w-10 text-purple-400" />
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold">
                {user.profiles?.display_name || 'Neighbor'}
              </h2>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                <span>Member since {memberSince}</span>
              </div>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <Separator />

          {/* Bio Section */}
          {user.profiles?.bio && (
            <div className="space-y-2">
              <h3 className="text-base font-medium">About</h3>
              <p className="text-sm text-gray-700">{user.profiles.bio}</p>
            </div>
          )}

          {/* Contact Information - Enhanced with icons and better layout */}
          <div className="space-y-3">
            <h3 className="text-base font-medium">Contact Information</h3>
            
            <div className="grid grid-cols-1 gap-2">
              {/* Email is always visible */}
              <div className="flex items-center space-x-3 text-sm">
                <div className="bg-gray-100 p-2 rounded-full">
                  <Mail className="h-4 w-4 text-gray-600" />
                </div>
                <span>{user.email}</span>
              </div>
              
              {/* Show phone if visible */}
              {user.profiles?.phone_visible && user.profiles?.phone_number && (
                <div className="flex items-center space-x-3 text-sm">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <Phone className="h-4 w-4 text-gray-600" />
                  </div>
                  <span>{user.profiles.phone_number}</span>
                </div>
              )}
              
              {/* Show address if visible */}
              {user.profiles?.address_visible && user.profiles?.address && (
                <div className="flex items-center space-x-3 text-sm">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <MapPin className="h-4 w-4 text-gray-600" />
                  </div>
                  <span>{user.profiles.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Access Needs */}
          {user.profiles?.needs_visible && user.profiles?.access_needs && (
            <div className="space-y-2">
              <h3 className="text-base font-medium">Access & Functional Needs</h3>
              <p className="text-sm text-gray-700 bg-purple-50 p-3 rounded-md">
                {user.profiles.access_needs}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
