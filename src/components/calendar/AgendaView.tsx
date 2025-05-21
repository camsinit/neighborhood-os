
import { Skeleton } from "@/components/ui/skeleton";
import { Event } from "@/types/localTypes";
import { createLogger } from "@/utils/logger";

// Create a logger for the AgendaView component
const logger = createLogger('AgendaView');

interface AgendaViewProps {
  events: Event[] | undefined;
  isLoading: boolean;
}

/**
 * AgendaView component displays events in a list format
 * 
 * This component:
 * - Shows all events in a simple list view
 * - Displays event details including title, time, and location
 * 
 * @param events - Array of events to display
 * @param isLoading - Whether events are loading
 */
const AgendaView = ({ events, isLoading }: AgendaViewProps) => {
  // Log for debugging
  logger.debug(`Rendering AgendaView with ${events?.length || 0} events`);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events && events.length > 0 ? (
        events.map(event => (
          <div 
            key={event.id} 
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            data-date={event.time.split('T')[0]}
          >
            <h3 className="text-lg font-medium">{event.title}</h3>
            <div className="text-sm text-gray-500">
              {new Date(event.time).toLocaleString()}
            </div>
            <div className="text-sm">{event.location}</div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 p-8">
          No events scheduled
        </div>
      )}
    </div>
  );
};

export default AgendaView;
