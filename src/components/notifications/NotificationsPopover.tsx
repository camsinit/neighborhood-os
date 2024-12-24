import { Bell } from "lucide-react";
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

const NotificationsPopover = () => {
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const [safetyUpdates, events, supportRequests] = await Promise.all([
        supabase
          .from("safety_updates")
          .select("id, title, type")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("events")
          .select("id, title")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("support_requests")
          .select("id, title")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      return [
        ...(safetyUpdates.data?.map(update => ({
          id: update.id,
          title: update.title,
          type: "safety" as const,
          link: `/safety/${update.id}`,
        })) || []),
        ...(events.data?.map(event => ({
          id: event.id,
          title: event.title,
          type: "event" as const,
          link: `/event/${event.id}`,
        })) || []),
        ...(supportRequests.data?.map(request => ({
          id: request.id,
          title: request.title,
          type: "support" as const,
          link: `/support/${request.id}`,
        })) || []),
      ].sort((a, b) => b.created_at - a.created_at).slice(0, 5);
    },
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-gray-100"
        >
          <Bell className="h-5 w-5" />
          {notifications?.length ? (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
        </div>
        <ScrollArea className="h-[300px]">
          {notifications?.length ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                {...notification}
                onClose={() => {}}
              />
            ))
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No new notifications
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;