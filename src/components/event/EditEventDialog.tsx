import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import EventForm from "@/components/events/EventForm";
import DeleteEventButton from "./DeleteEventButton";
import { Pencil } from "lucide-react";

interface EditEventDialogProps {
  event: {
    id: string;
    title: string;
    time: string;
    location: string;
    description: string | null;
    color: string;
    host_id: string;
    is_recurring?: boolean;
    recurrence_pattern?: string;
    recurrence_end_date?: string | null;
  };
  onDelete?: () => void;
  children?: React.ReactNode;
}

const EditEventDialog = ({ event, onDelete, children }: EditEventDialogProps) => {
  const [open, setOpen] = useState(false);

  const initialValues = {
    title: event.title,
    description: event.description || "",
    time: event.time,
    location: event.location,
    color: event.color,
    is_recurring: event.is_recurring || false,
    recurrence_pattern: event.recurrence_pattern || "",
    recurrence_end_date: event.recurrence_end_date || null,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="default">
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <EventForm
            initialValues={initialValues}
            eventId={event.id}
            onSuccess={() => setOpen(false)}
          />
          <DeleteEventButton eventId={event.id} onDelete={onDelete} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditEventDialog;