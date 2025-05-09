
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BellIcon } from "lucide-react";
import { NotificationsSection } from "./NotificationsSection";
import { useNotifications } from "@/hooks/notifications";

/**
 * Enhanced NotificationPopover component
 * Shows a summary of notifications in a popover
 */
export function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const { data: notifications } = useNotifications(false);
  
  // Count unread notifications
  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;
  
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="max-h-96 overflow-auto">
          <NotificationsSection onClose={handleClose} showArchived={false} />
        </div>
        <div className="p-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => {
              // This would typically open the full notification drawer
              setOpen(false);
            }}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
