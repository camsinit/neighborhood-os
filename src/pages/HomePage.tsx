
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import QuickActions from "@/components/QuickActions";
import ActivityFeed from "@/components/activity/ActivityFeed";
import NotificationItem from "@/components/notifications/NotificationItem";

/**
 * HomePage component
 * 
 * Main dashboard page that displays:
 * 1. Quick actions for common neighborhood tasks
 * 2. Notifications for the current user
 * 3. Recent activity feed from the neighborhood
 */
const HomePage = () => {
  const [showArchived, setShowArchived] = useState(false);
  const navigate = useNavigate();

  // Fetch notifications from the database
  const {
    data: notifications,
    refetch
  } = useQuery({
    queryKey: ["notifications", showArchived],
    queryFn: async () => {
      // Fetch data from multiple tables concurrently
      // For events data, we'll get the latest information directly
      const [safetyUpdates, events, supportRequests] = await Promise.all([
        supabase.from("safety_updates").select(`
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
          `).eq('is_archived', showArchived).order("created_at", {
        ascending: false
      }).limit(5),
        
        // Query events with a direct join to get up-to-date event information
        supabase.from("events").select(`
            id, 
            title, 
            created_at, 
            is_read, 
            is_archived,
            profiles:host_id (
              display_name,
              avatar_url
            )
          `).eq('is_archived', showArchived).order("created_at", {
        ascending: false
      }).limit(5),
        
        supabase.from("support_requests").select(`
            id, 
            title, 
            created_at, 
            is_read, 
            is_archived,
            profiles:user_id (
              display_name,
              avatar_url
            )
          `).eq('is_archived', showArchived).order("created_at", {
        ascending: false
      }).limit(5)]);
      
      // Process the results, transforming them into consistent notification objects
      // The important part is that we're using the latest event titles from the events table
      return [
        ...(safetyUpdates.data?.map(update => ({
          id: update.id,
          title: update.title,
          type: "safety" as const,
          created_at: update.created_at,
          is_read: update.is_read,
          is_archived: update.is_archived,
          context: {
            contextType: "safety_alert" as const,
            neighborName: update.profiles?.display_name,
            avatarUrl: update.profiles?.avatar_url
          }
        })) || []), 
        
        ...(events.data?.map(event => ({
          id: event.id,
          title: event.title, // This will always have the up-to-date title
          type: "event" as const,
          created_at: event.created_at,
          is_read: event.is_read,
          is_archived: event.is_archived,
          context: {
            contextType: "event_invite" as const,
            neighborName: event.profiles?.display_name,
            avatarUrl: event.profiles?.avatar_url
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
            neighborName: request.profiles?.display_name,
            avatarUrl: request.profiles?.avatar_url
          }
        })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  });

  // Handle clicks on notification items
  const handleItemClick = (type: "safety" | "event" | "support" | "skills" | "goods" | "neighbors", id: string) => {
    // Map notification types to their respective routes
    const routeMap = {
      safety: "/safety",
      event: "/calendar",
      support: "/care",
      skills: "/skills",
      goods: "/goods",
      neighbors: "/neighbors"
    };

    // Navigate to the appropriate page
    navigate(routeMap[type]);

    // Dispatch an event that the target page will listen for
    const event = new CustomEvent('highlightItem', {
      detail: {
        type,
        id,
      }
    });
    
    // Small delay to ensure navigation completes first
    setTimeout(() => {
      window.dispatchEvent(event);
    }, 100);

    refetch();
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-8">
          {/* Quick Actions Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Quick Actions</h2>
            <QuickActions />
          </section>

          <Separator className="my-8 bg-gray-200" />

          {/* Two Column Layout for Notifications and Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Notifications Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center" 
                  onClick={() => setShowArchived(!showArchived)}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  {showArchived ? "Show Active" : "Show Archived"}
                </Button>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 h-[600px] px-0 py-[3px]">
                <ScrollArea className="h-[550px]">
                  {notifications?.length ? (
                    <div className="space-y-1">
                      {notifications.map(notification => (
                        <NotificationItem
                          key={notification.id}
                          title={notification.title}
                          type={notification.type}
                          itemId={notification.id}
                          isRead={notification.is_read}
                          isArchived={notification.is_archived}
                          onClose={() => refetch()}
                          onItemClick={handleItemClick}
                          context={notification.context}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">
                        {showArchived ? "No archived notifications" : "No new notifications"}
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </section>

            {/* Neighborhood Activity Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Neighborhood Activity</h2>
              <div className="bg-white rounded-lg shadow-sm p-4 py-[3px]">
                <ActivityFeed />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
