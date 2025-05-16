/**
 * EventCardContent component
 * 
 * This component:
 * - Displays event details in a compact card format
 * - Shows different styling based on RSVP status
 */
import { Clock, Users } from "lucide-react";
import { Event } from "@/types/localTypes";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
interface EventCardContentProps {
  event: Event;
  isHost: boolean;
  isRsvped: boolean;
  rsvpCount: number;
  displayTime: string;
  isHighlighted?: boolean;
}
const EventCardContent = ({
  event,
  isHost,
  isRsvped,
  rsvpCount,
  displayTime,
  isHighlighted = false
}: EventCardContentProps) => {
  // Determine event color based on RSVP status
  const getEventColor = () => {
    if (isRsvped) {
      return isHost ? "border-blue-300 bg-blue-50 shadow-sm" : "border-green-300 bg-green-50 shadow-sm";
    }
    return "border-gray-200 bg-white shadow-sm";
  };
  return <motion.div data-event-id={event.id} className={cn("rounded-md px-2 py-1.5 mb-1.5 text-xs cursor-pointer hover:bg-opacity-80 border-l-4", getEventColor(), isHighlighted ? "ring-2 ring-blue-400" : "", isHost ? "border-l-blue-500" : isRsvped ? "border-l-green-500" : "border-l-gray-300")} animate={isHighlighted ? {
    scale: [1, 1.05, 1]
  } : {}} transition={{
    duration: 0.5
  }}>      
      <div className="font-medium line-clamp-2 text-gray-800">{event.title}</div>
      <div className="flex items-center gap-1 text-gray-600 mt-1">
        <Clock className="h-3 w-3" />
        <span className="truncate">{displayTime}</span>
      </div>
      {rsvpCount > 0}
    </motion.div>;
};
export default EventCardContent;