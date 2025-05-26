
/**
 * NotificationDrawer - Enhanced notification drawer with compact design options
 * 
 * This component now supports both compact and comfortable viewing modes
 * to maximize space efficiency while maintaining readability
 */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useNotificationsData } from "@/hooks/notifications/useNotificationsData";
import NotificationsList from "./sections/NotificationsList";

/**
 * Main notification drawer component with enhanced compact design
 */
const NotificationDrawer = () => {
  const [open, setOpen] = useState(false);
  
  // Use the enhanced notifications data hook
  const { data: notifications, isLoading, refetch } = useNotificationsData(false);
  
  // Calculate unread count for badge
  const unreadCount = notifications?.filter(n => !n.is_read && !n.is_archived).length || 0;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-left">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({unreadCount} unread)
              </span>
            )}
          </DrawerTitle>
        </DrawerHeader>
        
        {/* Enhanced notifications list with density controls */}
        <div className="overflow-y-auto flex-1">
          <NotificationsList 
            notifications={notifications} 
            isLoading={isLoading}
            showDensityControl={true}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default NotificationDrawer;
