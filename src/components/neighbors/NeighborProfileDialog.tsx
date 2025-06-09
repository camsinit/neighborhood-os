
import { UserWithRole } from "@/types/roles";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, MapPin, Phone, UserMinus } from "lucide-react";
import { useState } from "react";
import { useSuperAdminAccess } from "@/hooks/useSuperAdminAccess";
import { useRemoveNeighbor } from "./hooks/useRemoveNeighbor";
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

interface NeighborProfileDialogProps {
  user: UserWithRole | null;
  onClose: () => void;
}

/**
 * NeighborProfileDialog Component
 * 
 * Displays a neighbor's profile information in a dialog.
 * For super-admins, includes the ability to remove the neighbor from the neighborhood.
 */
export const NeighborProfileDialog = ({ user, onClose }: NeighborProfileDialogProps) => {
  // State for the removal confirmation dialog
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  
  // Check if current user is a super admin
  const { isSuperAdmin } = useSuperAdminAccess();
  
  // Hook for removing neighbors (only available to super admins)
  const { removeNeighbor, isRemoving } = useRemoveNeighbor();

  // Don't render if no user is selected
  if (!user) return null;

  /**
   * Handle the neighbor removal process
   * This will remove the user from the current neighborhood
   */
  const handleRemoveNeighbor = async () => {
    const success = await removeNeighbor(user.id);
    if (success) {
      // Close both dialogs on successful removal
      setShowRemoveConfirm(false);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={!!user} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Neighbor Profile</span>
              {/* Show remove button only for super admins */}
              {isSuperAdmin && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowRemoveConfirm(true)}
                  className="flex items-center gap-2"
                  disabled={isRemoving}
                >
                  <UserMinus className="h-4 w-4" />
                  Remove
                </Button>
              )}
            </DialogTitle>
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

      {/* Removal Confirmation Dialog */}
      <AlertDialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Neighbor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{user.profiles?.display_name || 'this neighbor'}</strong>{" "}
              from the neighborhood? This action will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Remove them from the neighborhood membership</li>
                <li>Hide their profile from other neighbors</li>
                <li>Archive their posts and activities</li>
              </ul>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveNeighbor}
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRemoving ? "Removing..." : "Remove Neighbor"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
