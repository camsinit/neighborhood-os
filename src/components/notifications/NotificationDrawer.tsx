
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BellIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NotificationsSection } from "./NotificationsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/hooks/notifications";

/**
 * Notification drawer accessible from the main layout
 * Shows both active and archived notifications in tabs
 */
export default function NotificationDrawer() {
  const [open, setOpen] = useState(false);
  const { data: notifications } = useNotifications(false);
  
  // Count unread notifications
  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;
  
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="active" className="mt-4">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-2">
            <NotificationsSection onClose={handleClose} showArchived={false} />
          </TabsContent>
          <TabsContent value="archived" className="mt-2">
            <NotificationsSection onClose={handleClose} showArchived={true} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
