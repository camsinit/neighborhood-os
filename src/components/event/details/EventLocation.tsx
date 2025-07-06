
import { MapPin } from "lucide-react";

/**
 * EventLocation component - Displays the event location
 * 
 * @param location - The location string to display
 */
interface EventLocationProps {
  location: string;
}

const EventLocation = ({ location }: EventLocationProps) => {
  // Only display if location is provided
  if (!location) return null;
  
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-hsl(var(--calendar-color)/0.1) flex items-center justify-center">
        <MapPin className="h-5 w-5 text-hsl(var(--calendar-color))" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-hsl(var(--muted-foreground))">Location</p>
        <p className="font-medium text-hsl(var(--foreground)) truncate">{location}</p>
      </div>
    </div>
  );
};

export default EventLocation;
