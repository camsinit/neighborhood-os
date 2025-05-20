
/**
 * DEPRECATED: This component is no longer used in the main application flow.
 * Invite functionality is now provided through the dedicated InvitePage component.
 * This file is kept only for reference or legacy support.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InviteDialogContent from "./invite/InviteDialogContent";

/**
 * InviteDialog Component
 * 
 * This is a simplified wrapper component that delegates the actual content 
 * to the InviteDialogContent component.
 * 
 * @deprecated Use InvitePage instead for the main application flow
 */
const InviteDialog = ({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void 
}) => {
  console.log("[InviteDialog] DEPRECATED: This component should not be used directly anymore");
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Invite a Neighbor
          </DialogTitle>
          <DialogDescription>
            Invite your neighbors to join your neighborhood community. You can send them an email invitation or share a direct link.
          </DialogDescription>
        </DialogHeader>
        <InviteDialogContent onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default InviteDialog;
