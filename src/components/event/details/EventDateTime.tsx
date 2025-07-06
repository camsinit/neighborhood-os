
import { Calendar, Clock } from "lucide-react";
import { formatInNeighborhoodTimezone } from "@/utils/dateUtils";
import { parseISO } from "date-fns";

/**
 * EventDateTime component - Displays formatted event date and time
 * 
 * This component shows the event's date and time in a consistent format,
 * adjusted for the neighborhood's timezone. Can be rendered in header or detail mode.
 * 
 * @param date - The event date as an ISO string
 * @param neighborhoodTimezone - The timezone of the neighborhood
 * @param isHeaderVersion - Whether to render as header version (white text, larger)
 */
interface EventDateTimeProps {
  date: string;
  neighborhoodTimezone: string;
  isHeaderVersion?: boolean;
}

const EventDateTime = ({ date, neighborhoodTimezone, isHeaderVersion = false }: EventDateTimeProps) => {
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

  if (isHeaderVersion) {
    return (
      <div className="flex items-center gap-2 text-white/90">
        <Calendar className="h-5 w-5" />
        <div>
          <div className="font-semibold">{formattedDate}</div>
          <div className="text-sm opacity-90">{formattedTime}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <Calendar className="h-5 w-5 text-hsl(var(--calendar-color)) mt-0.5 shrink-0" />
      <div>
        <div className="font-medium text-hsl(var(--foreground))">{formattedDate}</div>
        <div className="text-sm text-hsl(var(--muted-foreground))">
          {formattedTime} ({neighborhoodTimezone.replace('_', ' ')})
        </div>
      </div>
    </div>
  );
};

export default EventDateTime;
