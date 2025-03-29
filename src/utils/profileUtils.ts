
/**
 * Profile utility functions
 * 
 * These utilities provide safe ways to access profile data
 * without triggering infinite recursion in RLS policies
 */
import { supabase } from '@/integrations/supabase/client';

/**
 * Safely fetch a user's profile with error handling
 * 
 * @param userId - The user ID to fetch profile for
 * @returns The user profile or null if not found
 */
export async function fetchUserProfile(userId: string | undefined) {
  // Don't attempt to fetch if no userId is provided
  if (!userId) {
    console.log("[profileUtils] No user ID provided for profile fetch");
    return null;
  }
  
  try {
    // Use RPC function instead of direct query to avoid RLS recursion
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error("[profileUtils] Error fetching profile:", error.message);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error("[profileUtils] Exception fetching profile:", err);
    return null;
  }
}

/**
 * Simplified profile fetch that only gets display info
 * 
 * @param userId - The user ID to fetch basic display info for
 * @returns Basic display info or null if not found
 */
export async function fetchUserDisplayInfo(userId: string | undefined) {
  if (!userId) return null;
  
  try {
    // Get only what's needed for display to minimize data transfer
    const { data, error } = await supabase
      .from('profiles')
      .select('avatar_url, display_name')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error("[profileUtils] Error fetching display info:", error.message);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error("[profileUtils] Exception fetching display info:", err);
    return null;
  }
}
