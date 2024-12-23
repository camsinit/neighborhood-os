import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import DialogWrapper from "../dialog/DialogWrapper";
import { useState } from "react";
import EventForm from "../events/EventForm";
import DeleteEventButton from "./DeleteEventButton";
import { format } from "date-fns";

interface EditEventDialogProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    time: string;
    location: string;
    host_id: string;
    is_recurring?: boolean;
    recurrence_pattern?: string;
    recurrence_end_date?: string | null;
  };
  onDelete?: () => void;
}

const EditEventDialog = ({ event, onDelete }: EditEventDialogProps) => {
  const [open, setOpen] = useState(false);

  const initialValues = {
    title: event.title,
    description: event.description || "",
    date: format(new Date(event.time), "yyyy-MM-dd"),
    time: format(new Date(event.time), "HH:mm"),
    location: event.location,
    isRecurring: event.is_recurring || false,
    recurrencePattern: event.recurrence_pattern || "weekly",
    recurrenceEndDate: event.recurrence_end_date 
      ? format(new Date(event.recurrence_end_date), "yyyy-MM-dd")
      : "",
  };

  return (
    <DialogWrapper
      open={open}
      onOpenChange={setOpen}
      title="Edit Event"
    >
      <div className="space-y-4">
        <EventForm 
          onClose={() => setOpen(false)}
          initialValues={initialValues}
          eventId={event.id}
          mode="edit"
        />
        <div className="flex justify-end pt-4 border-t">
          <DeleteEventButton 
            eventId={event.id}
            hostId={event.host_id}
            eventTitle={event.title}
            onDelete={onDelete}
          />
        </div>
      </div>
    </DialogWrapper>
  );
};

export default EditEventDialog;