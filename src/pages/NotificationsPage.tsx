
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotificationItem from "@/components/notifications/NotificationItem";
import { useToast } from "@/components/ui/use-toast";

const NotificationsPage = () => {
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
              display_name
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
              display_name
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
            profiles:user_id (
              display_name
            )
          `)
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
          context: {
            contextType: "safety_alert" as const
          }
        })) || []),
        ...(events.data?.map(event => ({
          id: event.id,
          title: event.title,
          type: "event" as const,
          created_at: event.created_at,
          is_read: event.is_read,
          is_archived: event.is_archived,
          context: {
            contextType: "event_invite" as const
          }
        })) || []),
        ...(supportRequests.data?.map(request => ({
          id: request.id,
          title: request.title,
          type: "support" as const,
          created_at: request.created_at,
          is_read: request.is_read,
          is_archived: request.is_archived,
          context: {
            contextType: "help_request" as const,
            neighborName: request.profiles?.display_name
          }
        })) || []),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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

  return (
    <div className="h-full w-full bg-white">
      <div className="flex items-center justify-between p-8 border-b bg-white">
        <h2 className="text-2xl font-bold text-gray-900">
          {showArchived ? "Archived Notifications" : "Notifications"}
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setShowArchived(!showArchived)}
        >
          <Archive className="h-4 w-4" />
          {showArchived ? "Show Active" : "Show Archived"}
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-5rem)]">
        <div className="space-y-1">
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
                context={notification.context}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {showArchived ? "No archived notifications" : "No new notifications"}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default NotificationsPage;
