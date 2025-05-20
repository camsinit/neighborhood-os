
import { UserWithRole } from "@/types/roles";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MapPin, Phone } from "lucide-react";

interface NeighborProfileDialogProps {
  user: UserWithRole | null;
  onClose: () => void;
}

export const NeighborProfileDialog = ({ user, onClose }: NeighborProfileDialogProps) => {
  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Neighbor Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.profiles?.avatar_url || ''} />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">
                {user.profiles?.display_name || 'Neighbor'}
              </h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          {/* Bio Section */}
          {user.profiles?.bio && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">About</h3>
              <p className="text-sm">{user.profiles.bio}</p>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
            <div className="space-y-2">
              {user.profiles?.phone_visible && user.profiles?.phone_number && (
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{user.profiles.phone_number}</span>
                </div>
              )}
              
              {user.profiles?.address_visible && user.profiles?.address && (
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{user.profiles.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Access Needs */}
          {user.profiles?.needs_visible && user.profiles?.access_needs && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Access & Functional Needs</h3>
              <p className="text-sm">{user.profiles.access_needs}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
