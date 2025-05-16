
/**
 * EventCardList component
 * 
 * This component:
 * - Displays event details in a list format (for agenda view)
 * - Shows attendance status and RSVP counts
 */
import { Calendar, Clock, Users, MapPin } from "lucide-react";
import { Event } from "@/types/localTypes";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EventCardListProps {
  event: Event;
  isHost: boolean;
  isRsvped: boolean;
  rsvpCount: number;
  displayTime: string;
  displayDate: string;
  isHighlighted?: boolean;
}

const EventCardList = ({
  event,
  isHost,
  isRsvped,
  rsvpCount,
  displayTime,
  displayDate,
  isHighlighted = false
}: EventCardListProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`p-4 cursor-pointer rounded-xl ${isHighlighted ? 'ring-2 ring-blue-300' : ''}`}
      data-event-id={event.id}
    >
      <div className="flex justify-between">
        <div>
          <h3 className="font-semibold text-lg text-gray-800">{event.title}</h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-600 mt-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span>{displayDate}</span>
            </div>
            <span className="hidden sm:inline mx-1">•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>{displayTime}</span>
            </div>
            <span className="hidden sm:inline mx-1">•</span>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
        {rsvpCount > 0 && (
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full h-fit">
            <Users className="h-4 w-4" />
            <span className="font-medium">{rsvpCount}</span>
          </div>
        )}
      </div>
      {isRsvped && (
        <div className="mt-3">
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            isHost 
              ? "bg-blue-100 text-blue-800" 
              : "bg-green-100 text-green-800"
          )}>
            {isHost ? "You're hosting" : "You're attending"}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default EventCardList;
