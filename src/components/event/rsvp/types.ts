
/**
 * Props for RSVPButton component
 */
export interface RSVPButtonProps {
  /**
   * ID of the event to RSVP to
   */
  eventId: string;
  
  /**
   * Optional ID of the neighborhood the event belongs to
   */
  neighborhoodId?: string;
  
  /**
   * Initial RSVP state, defaults to false
   */
  initialRSVPState?: boolean;
  
  /**
   * Optional CSS class name
   */
  className?: string;
}
