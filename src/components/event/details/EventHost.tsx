
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
    <div className="flex items-start gap-3">
      <User className="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
      <div>
        <div className="font-medium">Host</div>
        <div className="text-sm text-gray-600">
          {hostName || 'Unknown Host'}
          {isCurrentUserHost && <Badge variant="outline" className="ml-2">You</Badge>}
        </div>
      </div>
    </div>
  );
};

export default EventHost;
