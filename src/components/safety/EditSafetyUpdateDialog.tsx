import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SafetyUpdateForm from "./SafetyUpdateForm";
import { Pencil } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";

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

const EditSafetyUpdateDialog = ({ update, children }: EditSafetyUpdateDialogProps) => {
  const [open, setOpen] = useState(false);
  const user = useUser();

  if (!user || user.id !== update.author_id) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="hover:bg-secondary"
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Safety Update</DialogTitle>
        </DialogHeader>
        <SafetyUpdateForm
          initialValues={{
            title: update.title,
            description: update.description || "",
            type: update.type,
          }}
          mode="edit"
          updateId={update.id}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditSafetyUpdateDialog;