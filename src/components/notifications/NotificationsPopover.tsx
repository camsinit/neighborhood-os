
import { Archive, Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import NotificationItem from "./NotificationItem";
import { useToast } from "@/components/ui/use-toast";
import { useState, ReactNode } from "react";

interface NotificationsPopoverProps {
  children?: ReactNode;
}

const NotificationsPopover = ({ children }: NotificationsPopoverProps) => {
  const { toast } = useToast();
  const [showArchived, setShowArchived] = useState(false);
  
  const { data: notifications, refetch } = useQuery({
    queryKey: ["notifications", showArchived],
    queryFn: async () => {
      const [safetyUpdates, events, supportRequests] = await Promise.all([
        supabase
          .from("safety_updates")
          .select("id, title, type, created_at, is_read, is_archived")
          .eq('is_archived', showArchived)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("events")
          .select("id, title, created_at, is_read, is_archived")
          .eq('is_archived', showArchived)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("support_requests")
          .select("id, title, created_at, is_read, is_archived")
          .eq('is_archived', showArchived)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      return [
        ...(safetyUpdates.data?.map(update => ({
          id: update.id,
          title: update.title,
          type: "safety" as const,
          created_at: update.created_at,
          is_read: update.is_read,
          is_archived: update.is_archived,
        })) || []),
        ...(events.data?.map(event => ({
          id: event.id,
          title: event.title,
          type: "event" as const,
          created_at: event.created_at,
          is_read: event.is_read,
          is_archived: event.is_archived,
        })) || []),
        ...(supportRequests.data?.map(request => ({
          id: request.id,
          title: request.title,
          type: "support" as const,
          created_at: request.created_at,
          is_read: request.is_read,
          is_archived: request.is_archived,
        })) || []),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
    },
  });

  const handleItemClick = (type: "safety" | "event" | "support", id: string) => {
    // Emit custom event
    const event = new CustomEvent('openItemDialog', {
      detail: { type, id }
    });
    window.dispatchEvent(event);

    // Show toast for event and support notifications
    if (type === 'event' || type === 'support') {
      toast({
        title: "Navigating to item",
        description: "The relevant section has been highlighted for you.",
        duration: 3000,
      });

      // Add highlight class to relevant section
      setTimeout(() => {
        const section = type === 'event' ? 
          document.querySelector('.calendar-container') : 
          document.querySelector('.mutual-support-container');
        
        if (section) {
          section.classList.add('highlight-section');
          // Remove highlight after animation
          setTimeout(() => {
            section.classList.remove('highlight-section');
          }, 2000);
        }

        // Scroll section into view
        section?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
    
    refetch();
  };

  const hasUnreadNotifications = notifications?.some(n => !n.is_read && !n.is_archived);

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-gray-100"
          >
            <Bell className="h-5 w-5" />
            {hasUnreadNotifications && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">
            {showArchived ? "Archived Notifications" : "Notifications"}
          </h4>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-gray-500"
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="h-4 w-4 mr-1" />
            {showArchived ? "Show Active" : "Show Archived"}
          </Button>
        </div>
        <ScrollArea className="h-[300px]">
          {notifications?.length ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                title={notification.title}
                type={notification.type}
                itemId={notification.id}
                isRead={notification.is_read}
                isArchived={notification.is_archived}
                onClose={() => {}}
                onItemClick={handleItemClick}
              />
            ))
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              {showArchived ? "No archived notifications" : "No new notifications"}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
