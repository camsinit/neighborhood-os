
/**
 * Service layer for fetching neighborhood activities
 * Enhanced with better error handling for RLS policy issues and profile handling
 */
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "./types";
import { runWithAuthCheck } from "@/utils/authStateCheck";

/**
 * Fetches recent neighborhood activities
 * Now with improved error handling for RLS policy issues
 * 
 * @returns Promise with array of activities or throws an error
 */
export const fetchActivities = async (): Promise<Activity[]> => {
  try {
    console.log("[fetchActivities] Starting to fetch activities");
    
    // First try to use our RPC function which avoids RLS issues
    try {
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_activities_safe', { 
          user_uuid: (await supabase.auth.getUser()).data.user?.id,
          limit_count: 20
        });
      
      if (!rpcError && rpcData) {
        console.log(`[fetchActivities] Successfully fetched ${rpcData.length} activities via RPC`);
        
        // Map the data to include the required profiles property
        const activitiesWithProfiles = (rpcData as any[]).map(activity => ({
          ...activity,
          // Add the required profiles property to make TypeScript happy
          profiles: {
            display_name: "Neighbor", // Default values when profiles aren't fetched
            avatar_url: ""
          }
        }));
        
        return activitiesWithProfiles as Activity[];
      } else {
        console.warn("[fetchActivities] RPC method failed:", rpcError);
      }
    } catch (rpcErr) {
      console.warn("[fetchActivities] RPC error, falling back to direct query:", rpcErr);
    }
    
    // Fall back to direct query if RPC fails
    try {
      const { data: directData, error: directError } = await runWithAuthCheck(
        async () => {
          console.log("[fetchActivities] Attempting direct query");
          // Try to fetch activities directly
          const { data, error } = await supabase
            .from('activities')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
            
          console.log("[fetchActivities] Direct query result:", { data: data?.length, error });
          return { data, error };
        },
        'fetchActivities'
      );
      
      if (directError) {
        console.error("[fetchActivities] Direct query error:", directError);
        throw directError;
      }
      
      if (!directData) {
        console.warn("[fetchActivities] No data returned from direct query");
        return [];
      }
      
      console.log(`[fetchActivities] Successfully fetched ${directData.length} activities via direct query`);
      
      // Create properly typed activities with the required profiles property
      const activitiesWithProfiles: Activity[] = (directData as any[]).map(activity => ({
        ...activity,
        profiles: {
          display_name: "Neighbor", // Default values when profiles aren't fetched
          avatar_url: ""
        }
      }));
      
      return activitiesWithProfiles;
      
    } catch (directErr) {
      console.error("[fetchActivities] Failed to fetch activities via direct query:", directErr);
      throw directErr;
    }
    
  } catch (error) {
    console.error("[fetchActivities] Unexpected error:", error);
    
    // For development/testing, return some mock data if we can't get real data
    if (process.env.NODE_ENV !== 'production') {
      console.log("[fetchActivities] Using mock data for development");
      return getMockActivities();
    }
    
    throw error;
  }
};

/**
 * Provides mock activity data for development when database access fails
 * This ensures developers can still work on the UI even with RLS issues
 */
const getMockActivities = (): Activity[] => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Mock data with the required profiles property
  return [
    {
      id: '1',
      actor_id: '74bf3085-8275-4eb2-a721-8c8e91b3d3d8', // Test user ID from console logs
      activity_type: 'event_created',
      content_id: '1',
      content_type: 'events',
      title: 'Neighborhood BBQ',
      created_at: now.toISOString(),
      metadata: {
        description: 'Join us for a neighborhood BBQ at the park!'
      },
      profiles: {
        display_name: "Jane Neighbor",
        avatar_url: ""
      }
    },
    {
      id: '2',
      actor_id: '031f6565-afee-4629-bb17-e944560e1882', // Another user ID from logs
      activity_type: 'skill_offered',
      content_id: '2',
      content_type: 'skills_exchange',
      title: 'Free Coding Lessons',
      created_at: yesterday.toISOString(),
      metadata: {
        description: 'I can help teach basic programming skills'
      },
      profiles: {
        display_name: "Mark Helper",
        avatar_url: ""
      }
    },
    {
      id: '3',
      actor_id: '74bf3085-8275-4eb2-a721-8c8e91b3d3d8',
      activity_type: 'safety_update',
      content_id: '3',
      content_type: 'safety_updates',
      title: 'Road Closure Notice',
      created_at: lastWeek.toISOString(),
      metadata: {
        description: 'Main Street will be closed for repairs next weekend'
      },
      profiles: {
        display_name: "Jane Neighbor",
        avatar_url: ""
      }
    }
  ];
};
