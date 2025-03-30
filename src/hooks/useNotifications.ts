
/**
 * Custom hook for fetching notifications
 * This hook centralizes the logic for fetching different notification types
 * and combines them into a unified list
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SkillRequestNotification } from "@/components/skills/types/skillTypes";

// Define types for notifications
export interface BaseNotification {
  id: string;
  title: string;
  type: "safety" | "event" | "support" | "skills" | "goods" | "neighbors";
  created_at: string;
  is_read: boolean;
  is_archived: boolean;
  context: {
    contextType: "help_request" | "event_invite" | "safety_alert" | "skill_request" | "goods_offer" | "goods_request" | "neighbor_join";
    neighborName: string | null;
    avatarUrl: string | null;
    skillRequestData?: SkillRequestNotification;
  };
}

/**
 * Custom hook that fetches notifications from multiple sources and combines them
 * 
 * @param showArchived Boolean flag to control whether to show archived notifications
 * @returns Query result containing the combined notifications
 */
export const useNotifications = (showArchived: boolean) => {
  return useQuery({
    queryKey: ["notifications", showArchived],
    queryFn: async (): Promise<BaseNotification[]> => {
      // Fetch data from multiple tables concurrently for better performance
      const [safetyUpdates, events, supportRequests, skillRequests, goodsItems] = await Promise.all([
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
        
        // Skill requests query - Uses proper foreign key relationship
        supabase
          .from("skill_sessions")
          .select(`
            id,
            created_at,
            status,
            skill_id,
            requester_id,
            provider_id,
            requester:requester_id (
              id
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
          .limit(5),
          
        // Goods exchange items query
        supabase
          .from("goods_exchange")
          .select(`
            id,
            title,
            request_type,
            created_at,
            is_read,
            is_archived,
            profiles:user_id (
              display_name,
              avatar_url
            )
          `)
          .eq('is_archived', showArchived)
          .order("created_at", { ascending: false })
          .limit(5)
      ]);

      // Get requester profiles in a separate query since the relation is not directly accessible
      const requesterIds = skillRequests.data?.map(session => session.requester_id) || [];
      const { data: requesterProfiles } = await supabase
        .from("profiles")
        .select('id, display_name, avatar_url')
        .in('id', requesterIds);

      // Create a lookup map for requester profiles
      const profilesMap = (requesterProfiles || []).reduce((map, profile) => {
        map[profile.id] = profile;
        return map;
      }, {} as Record<string, any>);

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
        
        // Skill request notifications
        ...(skillRequests.data?.map(session => {
          // Look up requester profile from our map
          const requesterProfile = profilesMap[session.requester_id] || {};
          
          // Convert skill session data into a notification format
          const skillRequestData: SkillRequestNotification = {
            skillId: session.skill_id,
            requesterId: session.requester_id,
            providerId: session.provider_id,
            skillTitle: session.skill?.title || "Unnamed skill",
            requesterName: requesterProfile.display_name || null,
            requesterAvatar: requesterProfile.avatar_url || null,
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
              neighborName: requesterProfile.display_name || null,
              avatarUrl: requesterProfile.avatar_url || null,
              skillRequestData
            }
          };
        }) || []),
        
        // Goods exchange notifications - new addition
        ...(goodsItems.data?.map(item => ({
          id: item.id,
          title: item.title,
          type: "goods" as const,
          created_at: item.created_at,
          is_read: item.is_read,
          is_archived: item.is_archived,
          context: {
            contextType: item.request_type === "offer" ? "goods_offer" as const : "goods_request" as const,
            neighborName: item.profiles?.display_name,
            avatarUrl: item.profiles?.avatar_url
          }
        })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  });
};
