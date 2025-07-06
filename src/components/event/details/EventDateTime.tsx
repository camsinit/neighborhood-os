
import { Calendar, Clock } from "lucide-react";
import { formatInNeighborhoodTimezone } from "@/utils/dateUtils";
import { parseISO } from "date-fns";

/**
 * EventDateTime component - Displays formatted event date and time
 * 
 * This component shows the event's date and time in a consistent format,
 * adjusted for the neighborhood's timezone
 * 
 * @param date - The event date as an ISO string
 * @param neighborhoodTimezone - The timezone of the neighborhood
 */
interface EventDateTimeProps {
  date: string;
  neighborhoodTimezone: string;
}

const EventDateTime = ({ date, neighborhoodTimezone }: EventDateTimeProps) => {
  // Parse the ISO date string into a Date object
  const eventDate = parseISO(date);
  
  // Format the date and time using the neighborhood timezone
  const formattedDate = formatInNeighborhoodTimezone(
    eventDate, 
    'EEEE, MMMM d, yyyy', 
    neighborhoodTimezone
  );
  
  const formattedTime = formatInNeighborhoodTimezone(
    eventDate, 
    'h:mm a', 
    neighborhoodTimezone
  );

  return (
    <div className="flex items-start gap-3">
      <Calendar className="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
      <div>
        <div className="font-medium">{formattedDate}</div>
        <div className="text-sm text-gray-500">
          {formattedTime} ({neighborhoodTimezone.replace('_', ' ')})
        </div>
      </div>
    </div>
  );
};

export default EventDateTime;
