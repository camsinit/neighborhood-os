import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import EventForm from "@/components/events/EventForm";
import DeleteEventButton from "./DeleteEventButton";
import { format } from "date-fns";

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

  const eventDate = new Date(event.time);
  const initialValues = {
    title: event.title,
    description: event.description || "",
    date: format(eventDate, "yyyy-MM-dd"),
    time: format(eventDate, "HH:mm"),
    location: event.location,
    isRecurring: event.is_recurring || false,
    recurrencePattern: event.recurrence_pattern || "weekly",
    recurrenceEndDate: event.recurrence_end_date 
      ? format(new Date(event.recurrence_end_date), "yyyy-MM-dd")
      : "",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="default"
          className="hover:bg-secondary"
        >
          {children}
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
            onClose={() => setOpen(false)}
            mode="edit"
          />
          <DeleteEventButton 
            eventId={event.id} 
            hostId={event.host_id}
            eventTitle={event.title}
            onDelete={onDelete} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditEventDialog;