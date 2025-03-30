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

type NotificationActionType = "view" | "rsvp" | "comment" | "help" | "respond" | "share";

const NotificationsPopover = ({ children }: NotificationsPopoverProps) => {
  const { toast } = useToast();
  const [showArchived, setShowArchived] = useState(false);
  
  const { data: notifications, refetch } = useQuery({
    queryKey: ["notifications", showArchived],
    queryFn: async () => {
      const [safetyUpdates, events, supportRequests] = await Promise.all([
        supabase
          .from("safety_updates")
          .select(`
            id, 
            title, 
            type, 
            created_at, 
            is_read, 
            is_archived,
            profiles:author_id (
              display_name,
              avatar_url
            )
          `)
          .eq('is_archived', showArchived)
          .order("created_at", { ascending: false })
          .limit(5),
        
        supabase
          .from("events")
          .select(`
            id, 
            title, 
            created_at, 
            is_read, 
            is_archived,
            profiles:host_id (
              display_name,
              avatar_url
            )
          `)
          .eq('is_archived', showArchived)
          .order("created_at", { ascending: false })
          .limit(5),
          
        supabase
          .from("support_requests")
          .select(`
            id, 
            title, 
            created_at, 
            is_read, 
            is_archived,
            category,
            profiles:user_id (
              display_name,
              avatar_url
            )
          `)
          .eq('is_archived', showArchived)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      return [
        ...(safetyUpdates.data?.map(update => ({
          itemId: update.id,
          title: update.title,
          type: "safety" as const,
          created_at: update.created_at,
          isRead: update.is_read,
          isArchived: update.is_archived,
          context: {
            contextType: "safety_alert" as const,
            neighborName: update.profiles?.display_name,
            avatarUrl: update.profiles?.avatar_url
          },
          actionLabel: "Comment",
          actionType: "comment" as NotificationActionType
        })) || []),
        
        ...(events.data?.map(event => ({
          itemId: event.id,
          title: event.title,
          type: "event" as const,
          created_at: event.created_at,
          isRead: event.is_read,
          isArchived: event.is_archived,
          context: {
            contextType: "event_invite" as const,
            neighborName: event.profiles?.display_name,
            avatarUrl: event.profiles?.avatar_url
          },
          actionLabel: "RSVP",
          actionType: "rsvp" as NotificationActionType
        })) || []),
        
        ...(supportRequests.data?.map(request => {
          const actionType: NotificationActionType = 
            request.category === 'care' ? "help" :
            request.category === 'goods' ? "respond" :
            request.category === 'skills' ? "share" : "view";

          return {
            itemId: request.id,
            title: request.title,
            type: "support" as const,
            created_at: request.created_at,
            isRead: request.is_read,
            isArchived: request.is_archived,
            context: {
              contextType: "help_request" as const,
              neighborName: request.profiles?.display_name,
              avatarUrl: request.profiles?.avatar_url
            },
            actionLabel: request.category === 'care' ? "Help" :
                        request.category === 'goods' ? "Respond" :
                        request.category === 'skills' ? "Share" : "View",
            actionType
          };
        }) || []),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
    },
  });

  const handleItemClick = (type: "safety" | "event" | "support", id: string) => {
    const event = new CustomEvent('openItemDialog', {
      detail: { type, id }
    });
    window.dispatchEvent(event);

    if (type === 'event' || type === 'support') {
      toast({
        title: "Navigating to item",
        description: "The relevant section has been highlighted for you.",
        duration: 3000,
      });

      setTimeout(() => {
        const section = type === 'event' ? 
          document.querySelector('.calendar-container') : 
          document.querySelector('.mutual-support-container');
        
        if (section) {
          section.classList.add('highlight-section');
          setTimeout(() => {
            section.classList.remove('highlight-section');
          }, 2000);
        }

        section?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
    
    refetch();
  };

  const hasUnreadNotifications = notifications?.some(n => !n.isRead && !n.isArchived);

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
                key={notification.itemId}
                {...notification}
                onClose={() => refetch()}
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
