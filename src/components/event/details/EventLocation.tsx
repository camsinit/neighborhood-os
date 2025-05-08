
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
    <div className="flex items-start gap-3">
      <MapPin className="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
      <div>
        <div className="font-medium">Location</div>
        <div className="text-sm text-gray-600">{location}</div>
      </div>
    </div>
  );
};

export default EventLocation;
