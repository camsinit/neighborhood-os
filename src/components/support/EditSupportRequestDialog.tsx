import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SupportRequestForm from "./SupportRequestForm";
import { Pencil } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";

interface EditSupportRequestDialogProps {
  request: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    request_type: string;
    user_id: string;
    valid_until: string;
    support_type: string;
  };
  children?: React.ReactNode;
}

const EditSupportRequestDialog = ({ request, children }: EditSupportRequestDialogProps) => {
  const [open, setOpen] = useState(false);
  const user = useUser();

  if (!user || user.id !== request.user_id) return null;

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
          <DialogTitle>Edit Support Request</DialogTitle>
        </DialogHeader>
        <SupportRequestForm
          initialValues={{
            title: request.title,
            description: request.description || "",
            category: request.category,
            requestType: request.request_type as "need" | "offer",
            validUntil: request.valid_until.split('T')[0],
            supportType: request.support_type as "immediate" | "ongoing",
          }}
          mode="edit"
          requestId={request.id}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditSupportRequestDialog;