
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
import { SkillRequestNotification } from "@/components/skills/types/skillTypes";

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
      const [safetyUpdates, events, supportRequests, skillRequests] = await Promise.all([
        // Safety updates query
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
        
        // Events query  
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
        
        // Support requests query
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
        }).limit(5),
        
        // Skill requests query - new addition
        supabase
          .from("skill_sessions")
          .select(`
            id,
            created_at,
            status,
            skill_id,
            requester_id,
            provider_id,
            requester:profiles!skill_sessions_requester_id_fkey (
              display_name,
              avatar_url
            ),
            skill:skill_id (
              id,
              title,
              description,
              availability,
              time_preferences
            )
          `)
          .eq('status', 'pending_provider_times')
          .order("created_at", { ascending: false })
          .limit(5)
      ]);

      // Process the results into notification objects
      return [
        // Safety notifications
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
        
        // Event notifications
        ...(events.data?.map(event => ({
          id: event.id,
          title: event.title,
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
        
        // Support request notifications
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
        })) || []),
        
        // Skill request notifications - new addition
        ...(skillRequests.data?.map(session => {
          // Convert skill session data into a notification format
          const skillRequestData: SkillRequestNotification = {
            skillId: session.skill_id,
            requesterId: session.requester_id,
            providerId: session.provider_id,
            skillTitle: session.skill?.title || "Unnamed skill",
            requesterName: session.requester?.display_name || null,
            requesterAvatar: session.requester?.avatar_url || null,
            timePreferences: session.skill?.time_preferences || null,
            availability: session.skill?.availability || null
          };
          
          return {
            id: session.id,
            title: session.skill?.title || "New skill request",
            type: "skills" as const,
            created_at: session.created_at,
            is_read: false, // Skill sessions don't have a is_read flag yet
            is_archived: false, // Skill sessions don't have is_archived yet
            context: {
              contextType: "skill_request" as const,
              neighborName: session.requester?.display_name || null,
              avatarUrl: session.requester?.avatar_url || null,
              skillRequestData
            }
          };
        }) || [])
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
