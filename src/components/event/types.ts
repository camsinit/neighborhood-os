
import { Event } from "@/types/localTypes";

export interface EventCardProps {
  event: Event;
  onDelete?: () => void;
}
