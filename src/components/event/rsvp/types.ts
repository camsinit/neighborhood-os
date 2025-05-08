
/**
 * Types for the RSVP Button component
 * 
 * This file contains shared types used across the RSVP functionality
 */

/**
 * Props for the RSVPButton component
 */
export interface RSVPButtonProps {
  eventId: string;           // The ID of the event to RSVP to
  neighborhoodId?: string;   // Optional neighborhood ID if known
  initialRSVPState?: boolean; // Whether the user has already RSVPed to this event
  className?: string;        // Additional CSS classes
}

/**
 * RSVP response data format from Supabase
 */
export interface RSVPResponse {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
  neighborhood_id?: string;
}
