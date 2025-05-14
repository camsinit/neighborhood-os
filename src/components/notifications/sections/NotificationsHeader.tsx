
/**
 * NotificationsHeader.tsx
 * 
 * Header section for the notifications popover
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";

interface NotificationsHeaderProps {
  showArchived: boolean;
  onToggleArchived: () => void;
  onArchiveAll: () => void;
  hasNotifications: boolean;
}

/**
 * Header component for the notifications popover
 */
const NotificationsHeader: React.FC<NotificationsHeaderProps> = ({
  showArchived,
  onToggleArchived,
  onArchiveAll,
  hasNotifications
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h4 className="font-semibold">
        Notifications
      </h4>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onToggleArchived}
          className="text-xs"
        >
          {showArchived ? "Active" : "Read"}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onArchiveAll}
          className="text-xs flex items-center gap-1"
          disabled={!hasNotifications}
        >
          <Archive className="h-3 w-3" />
          Archive All
        </Button>
      </div>
    </div>
  );
};

export default NotificationsHeader;
