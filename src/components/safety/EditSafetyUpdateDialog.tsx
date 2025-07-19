
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
    image_url?: string | null; // Add image_url to the interface
  };
  children?: React.ReactNode;
}

/**
 * EditSafetyUpdateDialog - Shows a dialog to edit an existing safety update
 * Now includes support for editing images
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

  // Type cast the update.type to ensure it matches our schema
  const safetyType = update.type as "Housing/Rentals" | "Suspicious Activity" | "Ideas & Inspiration";

  // Pass the correct props to the SafetyUpdateForm component, including image URL
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
            title: update.title,
            description: update.description || "",
            type: safetyType,
            imageUrl: update.image_url || "", // Include the image URL in existing data
          }}
          onSuccess={() => setOpen(false)}
          updateId={update.id}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditSafetyUpdateDialog;
