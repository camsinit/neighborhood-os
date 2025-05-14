
/**
 * NotificationDrawer.tsx
 * 
 * Enhanced notification drawer with modern design and specialized notification cards
 * - Now with improved scrolling for better user experience
 * - Fully integrated with our new minimalist notification components
 */
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { BellRing, Archive } from "lucide-react"; // Added Archive icon import
import { NotificationsSection } from "./NotificationsSection";
import { useState } from "react";
import { useNotifications } from "@/hooks/notifications";
import { ScrollArea } from "@/components/ui/scroll-area"; 
import { archiveNotification } from "@/hooks/notifications/notificationActions"; // Import archive function
import { toast } from "sonner"; // Import toast for feedback

/**
 * A full drawer component for displaying notifications with buttons for 
 * viewing archived notifications and archiving all notifications
 */
export default function NotificationDrawer() {
  // State for tracking whether the drawer is open
  const [open, setOpen] = useState(false);
  
  // State for showing archived notifications
  const [showArchived, setShowArchived] = useState(false);
  
  // Get unread notification count for badge
  const { data: activeNotifications, refetch } = useNotifications(false);
  const unreadCount = activeNotifications?.filter(n => !n.is_read).length || 0;
  
  /**
   * Function to archive all notifications
   * This provides user feedback and refreshes the list afterward
   */
  const handleArchiveAll = async () => {
    // Safety check - if no notifications, don't do anything
    if (!activeNotifications || activeNotifications.length === 0) {
      toast.info("No notifications to archive");
      return;
    }
    
    // Show processing toast
    toast.loading("Archiving all notifications...");
    
    try {
      // Archive each notification one by one
      const promises = activeNotifications.map(notification => 
        archiveNotification(notification.id)
      );
      
      // Wait for all archive operations to complete
      await Promise.all(promises);
      
      // Show success message
      toast.success(`Archived ${activeNotifications.length} notifications`);
      
      // Refresh the notifications list
      refetch();
    } catch (error) {
      // Show error message if something went wrong
      console.error("Error archiving all notifications:", error);
      toast.error("Failed to archive all notifications");
    }
  };
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {/* Enhanced notification button styling for better visibility */}
        <Button 
          variant="outline" 
          size="lg" 
          className="relative flex items-center gap-2 border-2 hover:bg-purple-50 hover:border-purple-300 transition-colors"
        >
          <BellRing className="h-5 w-5 text-purple-600" />
          <span className="hidden sm:inline text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 h-5 w-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-hidden flex flex-col p-0">
        {/* Modified header with action buttons */}
        <SheetHeader className="p-4 border-b">
          <div className="flex justify-between items-center">
            <SheetTitle>Notifications</SheetTitle>
            <div className="flex space-x-2">
              {/* Toggle button to switch between active and archived */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowArchived(!showArchived)}
                className="text-xs"
              >
                {showArchived ? "Active" : "Read"}
              </Button>
              
              {/* Archive All button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleArchiveAll}
                className="text-xs flex items-center gap-1"
                disabled={!activeNotifications || activeNotifications.length === 0}
              >
                <Archive className="h-3 w-3" />
                Archive All
              </Button>
            </div>
          </div>
        </SheetHeader>
        
        {/* Content with ScrollArea for smooth scrolling experience */}
        <ScrollArea className="h-[calc(100vh-150px)] flex-1">
          <NotificationsSection 
            onClose={() => setOpen(false)} 
            showArchived={showArchived}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
