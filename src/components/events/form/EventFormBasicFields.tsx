
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Props for the EventFormBasicFields component
 */
interface EventFormBasicFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  location: string;
  setLocation: (location: string) => void;
  date: string;
  setDate: (date: string) => void;
  time: string;
  setTime: (time: string) => void;
}

/**
 * Component that renders the basic event fields
 * 
 * This component handles the main event details like title, description,
 * date, time, and location.
 */
const EventFormBasicFields = ({
  title,
  setTitle,
  description,
  setDescription,
  location,
  setLocation,
  date,
  setDate,
  time,
  setTime
}: EventFormBasicFieldsProps) => {
  return (
    <>
      {/* Event Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Event Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Enter event title"
        />
      </div>
      
      {/* Event Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Describe your event"
          className="min-h-[100px]"
        />
      </div>
      
      {/* Event Date and Time */}
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
      
      {/* Event Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          placeholder="Where will this event take place?"
        />
      </div>
    </>
  );
};

export default EventFormBasicFields;
