import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { useEventSubmit } from "@/hooks/events/useEventSubmit";
import { useQueryClient } from "@tanstack/react-query";

interface EventFormProps {
  onClose: () => void;
  onAddEvent?: (event: any) => void;
}

const EventForm = ({ onClose, onAddEvent }: EventFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  
  const queryClient = useQueryClient();
  
  const { handleSubmit } = useEventSubmit({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onClose();
      if (onAddEvent) {
        onAddEvent({
          title,
          description,
          date,
          time,
          location,
        });
      }
      setTitle("");
      setDescription("");
      setDate("");
      setTime("");
      setLocation("");
    }
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit({
      title,
      description,
      date,
      time,
      location,
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Event Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>
      <DialogFooter>
        <Button type="submit">Add Event</Button>
      </DialogFooter>
    </form>
  );
};

export default EventForm;