
/**
 * NotificationDrawer.tsx
 * 
 * Enhanced notification drawer with modern design and specialized notification cards
 * - Now with improved scrolling for better user experience
 * - Fully integrated with our new robust notification handling system
 */
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { BellRing, RefreshCw } from "lucide-react"; 
import { NotificationsSection } from "./NotificationsSection";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotificationsPopoverData } from "@/hooks/notifications/useNotificationsPopoverData";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createLogger } from "@/utils/logger";

// Create a logger for this component
const logger = createLogger('NotificationDrawer');

/**
 * A full drawer component for displaying notifications with tabs for filtering
 * between active and archived notifications
 */
export default function NotificationDrawer() {
  // State for tracking whether the drawer is open
  const [open, setOpen] = useState(false);
  
  // Get notification data with our enhanced hook
  const { data: activeNotifications, refreshNotifications, isLoading } = useNotificationsPopoverData(false);
  
  // Count unread notifications for the badge
  const unreadCount = activeNotifications?.filter(n => !n.is_read).length || 0;
  
  // Handle manual refresh
  const handleRefresh = () => {
    logger.info("Manual refresh requested by user");
    refreshNotifications();
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
        <SheetHeader className="p-4 border-b flex flex-row items-center justify-between">
          <SheetTitle>Notifications</SheetTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </SheetHeader>
        
        <Tabs defaultValue="active" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-2 mx-4 mt-2">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
          
          {/* Wrap content in ScrollArea for smooth scrolling experience */}
          <TabsContent 
            value="active" 
            className="flex-1 mt-2 px-0"
            tabIndex={-1}
          >
            <ScrollArea className="h-[calc(100vh-150px)]">
              <NotificationsSection 
                onClose={() => setOpen(false)} 
                showArchived={false}
              />
            </ScrollArea>
          </TabsContent>
          
          <TabsContent 
            value="archived" 
            className="flex-1 mt-2 px-0"
            tabIndex={-1}
          >
            <ScrollArea className="h-[calc(100vh-150px)]">
              <NotificationsSection 
                onClose={() => setOpen(false)} 
                showArchived={true}
              />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
