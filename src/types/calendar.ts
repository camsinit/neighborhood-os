export interface CalendarEvent {
  id: number;
  title: string;
  host: string;
  time: string;
  location: string;
  description: string;
  color: string;
  attendees?: number;
}

export type CalendarEvents = {
  [key: number]: CalendarEvent[];
};

// This Event type is no longer used - we use the one from localTypes.ts instead
// Keeping it here for backward compatibility in case other files still import from here
export type Event = {
  id: string;
  title: string;
  description: string | null;
  time: string;
  location: string;
  host_id: string;
  created_at: string;
};
