import { Event } from "@/types/localTypes";

/**
 * Props for the EventCard component
 * Note: We don't need a color property since the color is 
 * determined internally based on RSVP status
 */
export interface EventCardProps {
  event: Event;
  onDelete?: () => void;
  isHighlighted?: boolean;
  listView?: boolean;
}

/**
 * Props for the EventSheetContent component
 */
export interface EventSheetContentProps {
  event: Event;
  EditButton?: React.FC;
}
