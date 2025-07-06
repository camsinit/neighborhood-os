
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * EventHost component - Displays information about the event host
 * 
 * @param hostName - Display name of the host
 * @param isCurrentUserHost - Whether the current user is the host
 */
interface EventHostProps {
  hostName: string;
  isCurrentUserHost: boolean;
}

const EventHost = ({ hostName, isCurrentUserHost }: EventHostProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-hsl(var(--calendar-color)/0.1) flex items-center justify-center">
        <User className="h-5 w-5 text-hsl(var(--calendar-color))" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-hsl(var(--muted-foreground))">Host</p>
        <div className="flex items-center gap-2">
          <p className="font-medium text-hsl(var(--foreground))">
            {hostName || 'Unknown Host'}
          </p>
          {isCurrentUserHost && (
            <Badge variant="secondary" className="text-xs bg-hsl(var(--calendar-color)/0.1) text-hsl(var(--calendar-color)) border-hsl(var(--calendar-color)/0.2)">
              You
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventHost;
