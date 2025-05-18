
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
 * @param open - Whether the dialog is open
 * @param onOpenChange - Function to call when open state changes
 */
const InviteDialog = ({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void 
}) => {
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
