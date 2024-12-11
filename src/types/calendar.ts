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