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

export type Event = {
  id: string;
  title: string;
  description: string | null;
  time: string;
  location: string;
  host_id: string;
  created_at: string;
};