
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserWithRole } from "@/types/roles";
import { useNeighborhood } from "@/contexts/NeighborhoodContext";

/**
 * Custom hook that fetches users in the current neighborhood
 * 
 * UPDATED: Now fetches real email addresses for users who have email_visible = true
 * using the secure get_neighborhood_user_emails function
 */
export const useNeighborUsers = () => {
  // Get the current neighborhood from context
  const { currentNeighborhood } = useNeighborhood();

  // Log initial neighborhood context for debugging
  console.log("[useNeighborUsers] Starting hook with neighborhood:", {
    neighborhoodId: currentNeighborhood?.id,
    neighborhoodName: currentNeighborhood?.name,
    timestamp: new Date().toISOString()
  });

  return useQuery({
    // Include neighborhood ID in query key for automatic refetching when it changes
    queryKey: ['users-with-roles', currentNeighborhood?.id],
    queryFn: async () => {
      // If no neighborhood found, return empty array
      if (!currentNeighborhood?.id) {
        console.log("[useNeighborUsers] No neighborhood found, returning empty array");
        return [];
      }

      console.log("[useNeighborUsers] Fetching users for neighborhood:", currentNeighborhood.id);
      
      try {
        // First, get neighborhood members using direct table query
        const { data: membersData, error: membersError } = await supabase
          .from('neighborhood_members')
          .select('user_id')
          .eq('neighborhood_id', currentNeighborhood.id)
          .eq('status', 'active');
          
        if (membersError) {
          console.error("[useNeighborUsers] Error fetching neighborhood members:", membersError);
          throw membersError;
        }
        
        if (!membersData || membersData.length === 0) {
          console.log("[useNeighborUsers] No members found in neighborhood");
          return [];
        }

        console.log("[useNeighborUsers] Found members:", {
          memberCount: membersData.length,
          neighborhoodId: currentNeighborhood.id
        });
        
        // Get user IDs for profile lookup
        const userIds = membersData.map(m => m.user_id);
        
        // Get profiles for these users using direct table query
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, address, phone_number, access_needs, email_visible, phone_visible, address_visible, needs_visible, bio')
          .in('id', userIds);
          
        if (profilesError) {
          console.error("[useNeighborUsers] Error fetching profiles:", profilesError);
          throw profilesError;
        }

        // Fetch visible email addresses using our secure function
        const { data: emailsData, error: emailsError } = await supabase
          .rpc('get_neighborhood_user_emails', {
            target_neighborhood_id: currentNeighborhood.id
          });

        if (emailsError) {
          console.error("[useNeighborUsers] Error fetching emails:", emailsError);
          // Continue without emails rather than failing completely
        }

        // Create a map of user_id to email for easy lookup
        const emailMap = new Map<string, string>();
        if (emailsData) {
          emailsData.forEach((emailEntry: any) => {
            emailMap.set(emailEntry.user_id, emailEntry.email);
          });
        }
        
        // Transform data into expected format with real email addresses when visible
        const usersWithProfiles = profilesData?.map((profile: any) => {
          // Get the actual email if the user has email_visible = true
          const actualEmail = emailMap.get(profile.id);
          
          return {
            id: profile.id,
            // Show actual email if available and visible, otherwise show a placeholder
            email: actualEmail || (profile.email_visible ? 'Email contact available' : 'Email not shared'),
            created_at: new Date().toISOString(), // Default timestamp
            roles: ['user'], // Default role
            profiles: {
              display_name: profile.display_name || 'Neighbor',
              avatar_url: profile.avatar_url,
              address: profile.address,
              phone_number: profile.phone_number,
              access_needs: profile.access_needs,
              email_visible: profile.email_visible,
              phone_visible: profile.phone_visible,
              address_visible: profile.address_visible,
              needs_visible: profile.needs_visible,
              bio: profile.bio,
              // Store the actual email in the profile for contact display
              email: actualEmail
            }
          };
        }) || [];
        
        return usersWithProfiles as UserWithRole[];
      } catch (error) {
        console.error("[useNeighborUsers] Error in data fetching:", error);
        throw error;
      }
    },
    // Always enable the query
    enabled: !!currentNeighborhood?.id
  });
};
