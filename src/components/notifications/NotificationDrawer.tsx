
/**
 * NotificationDrawer.tsx
 * 
 * Enhanced notification drawer with modern design and specialized notification cards
 * - Now with improved scrolling for better user experience
 * - Fully integrated with our new minimalist notification components
 */
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { BellRing } from "lucide-react"; // Changed from Bell to BellRing for better visibility
import { NotificationsSection } from "./NotificationsSection";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/hooks/notifications";
import { ScrollArea } from "@/components/ui/scroll-area"; // Added ScrollArea import

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
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Notifications</SheetTitle>
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
