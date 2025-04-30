
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
      // Get the current user ID
      const userId = (await supabase.auth.getUser()).data.user?.id;
      console.log("[fetchActivities] Current user ID:", userId);
      
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_activities_safe', { 
          user_uuid: userId,
          limit_count: 20
        });
      
      if (!rpcError && rpcData) {
        console.log(`[fetchActivities] Successfully fetched ${rpcData.length} activities via RPC`);
        
        // Log the first few activities to diagnose issues
        if (rpcData.length > 0) {
          console.log("[fetchActivities] Sample activity data:", rpcData[0]);
        } else {
          console.log("[fetchActivities] RPC returned empty result array");
        }
        
        // Fetch profiles in bulk for all activities
        const actorIds = [...new Set((rpcData as any[]).map(activity => activity.actor_id))];
        console.log(`[fetchActivities] Fetching profiles for ${actorIds.length} unique actors`);
        
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', actorIds);
          
        console.log(`[fetchActivities] Fetched ${profilesData?.length || 0} profile records`);
        
        // Create a map of profiles for easy lookup
        const profilesMap = (profilesData || []).reduce((map, profile) => {
          map[profile.id] = {
            display_name: profile.display_name || "Neighbor",
            avatar_url: profile.avatar_url || ""
          };
          return map;
        }, {} as Record<string, {display_name: string, avatar_url: string}>);
        
        // Map the data to include the required profiles property
        const activitiesWithProfiles = (rpcData as any[]).map(activity => {
          // Look up the profile in our map or use default values
          const profile = profilesMap[activity.actor_id] || {
            display_name: "Neighbor", // Default values when profiles aren't found
            avatar_url: ""
          };
          
          return {
            ...activity,
            profiles: profile
          };
        });
        
        console.log(`[fetchActivities] Returning ${activitiesWithProfiles.length} activities with profiles`);
        return activitiesWithProfiles as Activity[];
      } else {
        console.warn("[fetchActivities] RPC method failed:", rpcError);
      }
    } catch (rpcErr) {
      console.warn("[fetchActivities] RPC error, falling back to direct query:", rpcErr);
    }
    
    // Fall back to direct query if RPC fails
    try {
      console.log("[fetchActivities] Attempting direct query with profiles join");
      
      // Improved direct query with profiles join
      const { data: directData, error: directError } = await supabase
        .from('activities')
        .select(`
          *,
          profiles:actor_id(display_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(20);
        
      console.log("[fetchActivities] Direct query result:", { 
        dataLength: directData?.length, 
        error: directError?.message || null,
        hasProfiles: directData?.[0]?.profiles ? 'yes' : 'no'
      });
      
      if (directError) {
        console.error("[fetchActivities] Direct query error:", directError);
        
        // Try simpler query without the profiles join
        console.log("[fetchActivities] Attempting simplified direct query");
        const { data: simpleData, error: simpleError } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (simpleError) {
          console.error("[fetchActivities] Simple query also failed:", simpleError);
          throw simpleError;
        }
        
        if (!simpleData || simpleData.length === 0) {
          console.warn("[fetchActivities] No data returned from simple query");
          return [];
        }
        
        console.log(`[fetchActivities] Successfully fetched ${simpleData.length} activities via simple query`);
        
        // Fetch profiles separately since join doesn't work
        const actorIds = [...new Set(simpleData.map(activity => activity.actor_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', actorIds);
          
        // Create a map of profiles for easy lookup
        const profilesMap = (profilesData || []).reduce((map, profile) => {
          map[profile.id] = {
            display_name: profile.display_name || "Neighbor",
            avatar_url: profile.avatar_url || ""
          };
          return map;
        }, {} as Record<string, {display_name: string, avatar_url: string}>);
        
        // Add profiles to activities
        const activitiesWithProfiles = simpleData.map(activity => ({
          ...activity,
          profiles: profilesMap[activity.actor_id] || {
            display_name: "Neighbor", // Default values when profiles aren't found
            avatar_url: ""
          }
        }));
        
        return activitiesWithProfiles as Activity[];
      }
      
      if (!directData || directData.length === 0) {
        console.warn("[fetchActivities] No data returned from direct query");
        return [];
      }
      
      console.log(`[fetchActivities] Successfully fetched ${directData.length} activities via direct query`);
      
      // Check if we have nested profiles, and format them if needed
      const activitiesWithProfiles = directData.map(activity => {
        // Handle potential nested profiles from the join
        if (activity.profiles && typeof activity.profiles === 'object') {
          return {
            ...activity,
            profiles: {
              display_name: activity.profiles.display_name || "Neighbor",
              avatar_url: activity.profiles.avatar_url || ""
            }
          };
        }
        
        // Add profiles if they're missing
        return {
          ...activity,
          profiles: {
            display_name: "Neighbor",
            avatar_url: ""
          }
        };
      });
      
      return activitiesWithProfiles as Activity[];
      
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
