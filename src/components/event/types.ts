export interface EventCardProps {
  event: {
    id: string;
    title: string;
    time: string;
    location: string;
    description: string | null;
    color: string;
    host_id: string;
    is_recurring?: boolean;
    recurrence_pattern?: string;
    recurrence_end_date?: string | null;
    profiles?: {
      display_name: string | null;
    };
  };
  onDelete?: () => void;
}