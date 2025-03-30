
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SafetyUpdateForm from "./SafetyUpdateForm";
import { Pencil } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";

// Define the props for this component
interface EditSafetyUpdateDialogProps {
  update: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    author_id: string;
  };
  children?: React.ReactNode;
}

/**
 * EditSafetyUpdateDialog - Shows a dialog to edit an existing safety update
 * 
 * @param update - The safety update data to edit
 * @param children - Optional child elements to use as trigger
 */
const EditSafetyUpdateDialog = ({ update, children }: EditSafetyUpdateDialogProps) => {
  // State to track dialog open state
  const [open, setOpen] = useState(false);
  
  // Get current user for permission check
  const user = useUser();

  // Only show edit button if user is the author
  if (!user || user.id !== update.author_id) return null;

  // Use existingData prop instead of initialValues to match component API
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            variant="ghost" 
            size="sm"
            className="hover:bg-secondary"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Safety Update</DialogTitle>
        </DialogHeader>
        <SafetyUpdateForm
          existingData={{
            id: update.id,
            title: update.title,
            description: update.description || "",
            type: update.type,
          }}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditSafetyUpdateDialog;
