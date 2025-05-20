
import { useEventRSVPs } from "@/utils/queries/useEventRSVPs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

/**
 * Props for the RSVPList component
 */
interface RSVPListProps {
  eventId: string;
  className?: string;
  showEmptyState?: boolean;
}

/**
 * RSVPList Component
 * 
 * Displays a list of users who have RSVP'd to an event
 * 
 * @param eventId - The ID of the event to show RSVPs for
 * @param className - Optional CSS class name for styling
 * @param showEmptyState - Whether to show a message when no RSVPs exist
 */
const RSVPList = ({ eventId, className = "", showEmptyState = true }: RSVPListProps) => {
  // Fetch RSVPs for this event
  const { data: rsvps, isLoading, error } = useEventRSVPs(eventId);
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-500 ${className}`}>
        <span className="animate-pulse">Loading attendees...</span>
      </div>
    );
  }
  
  // Handle error state
  if (error) {
    console.error("[RSVPList] Error:", error);
    return null; // Don't show anything if there's an error
  }
  
  // Handle empty state
  if (!rsvps?.length && showEmptyState) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-500 ${className}`}>
        <span>No attendees yet. Be the first to RSVP!</span>
      </div>
    );
  }
  
  // No attendees and not showing empty state
  if (!rsvps?.length) {
    return null;
  }
  
  // Calculate how many avatars to show before "and X more"
  const MAX_AVATARS_TO_SHOW = 5;
  const displayedRsvps = rsvps.slice(0, MAX_AVATARS_TO_SHOW);
  const remainingCount = Math.max(0, rsvps.length - MAX_AVATARS_TO_SHOW);
  
  return (
    <div className={`${className}`}>
      <h4 className="font-medium mb-2">Attendees ({rsvps.length})</h4>
      <div className="flex -space-x-2">
        {/* Show avatars for the first few RSVPs */}
        {displayedRsvps.map((rsvp) => (
          <Avatar key={rsvp.id} className="border-2 border-background w-8 h-8">
            <AvatarImage 
              src={rsvp.profiles?.avatar_url || ""} 
              alt={rsvp.profiles?.display_name || "Attendee"} 
            />
            <AvatarFallback className="bg-gray-200 text-gray-600">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        ))}
        
        {/* Show "and X more" if there are additional RSVPs */}
        {remainingCount > 0 && (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border-2 border-background text-xs font-medium">
            +{remainingCount}
          </div>
        )}
      </div>
      
      {/* Show names of visible attendees */}
      <div className="mt-2 text-sm text-gray-600">
        {displayedRsvps
          .map((rsvp) => rsvp.profiles?.display_name || "Anonymous")
          .join(", ")}
        {remainingCount > 0 && ` and ${remainingCount} more`}
      </div>
    </div>
  );
};

export default RSVPList;
