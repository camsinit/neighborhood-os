
/**
 * NotificationDrawer.tsx
 * 
 * Enhanced notification drawer with modern design and specialized notification cards
 */
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { NotificationsSection } from "./NotificationsSection";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/hooks/notifications";

/**
 * A full drawer component for displaying notifications with tabs for filtering
 * between active and archived notifications
 */
export default function NotificationDrawer() {
  // State for tracking whether the drawer is open
  const [open, setOpen] = useState(false);
  
  // Get unread notification count for badge
  const { data: activeNotifications } = useNotifications(false);
  const unreadCount = activeNotifications?.filter(n => !n.is_read).length || 0;
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-hidden flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        
        <Tabs defaultValue="active" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-2 mx-4 mt-2">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
          
          <TabsContent 
            value="active" 
            className="flex-1 overflow-auto mt-2"
            tabIndex={-1}
          >
            <NotificationsSection 
              onClose={() => setOpen(false)} 
              showArchived={false}
            />
          </TabsContent>
          
          <TabsContent 
            value="archived" 
            className="flex-1 overflow-auto mt-2"
            tabIndex={-1}
          >
            <NotificationsSection 
              onClose={() => setOpen(false)} 
              showArchived={true}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
