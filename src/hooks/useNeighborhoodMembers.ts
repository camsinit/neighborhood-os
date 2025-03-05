
/**
 * useNeighborhoodMembers Hook
 * 
 * This hook manages fetching and displaying members of the current neighborhood.
 * It leverages the useNeighborhood hook and the neighborhood_members_with_profiles view
 * to provide simple access to member data.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNeighborhood } from './useNeighborhood';

// Define the member type with profile information
export interface NeighborhoodMember {
  membership_id: string;
  user_id: string;
  neighborhood_id: string;
  status: string;
  joined_at: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  address: string | null;
  phone_number: string | null;
  email_visible: boolean | null;
  phone_visible: boolean | null;
  address_visible: boolean | null;
  needs_visible: boolean | null;
  access_needs: string | null;
  email?: string | null; // From auth.users view if available
}

/**
 * Custom hook to fetch members of the current neighborhood
 * 
 * This hook ensures we only see members of the currently selected neighborhood
 * and handles loading states and errors.
 */
export function useNeighborhoodMembers() {
  // Get the current neighborhood
  const { neighborhood, isLoading: isLoadingNeighborhood } = useNeighborhood();
  
  // Query to fetch neighborhood members
  return useQuery({
    queryKey: ['neighborhood-members', neighborhood?.id],
    queryFn: async () => {
      if (!neighborhood?.id) {
        console.log("[useNeighborhoodMembers] No neighborhood found, skipping members fetch");
        return [];
      }
      
      try {
        // Fetch members using the view we created
        const { data: members, error: membersError } = await supabase
          .from('neighborhood_members_with_profiles')
          .select('*')
          .eq('neighborhood_id', neighborhood.id);
          
        if (membersError) {
          console.error("[useNeighborhoodMembers] Error fetching members:", membersError);
          throw membersError;
        }
        
        // Fetch email addresses for members if available
        const userIds = members.map(m => m.user_id);
        const { data: authUsers, error: authError } = await supabase
          .from('auth_users_view')
          .select('id, email')
          .in('id', userIds);
          
        if (authError) {
          console.error("[useNeighborhoodMembers] Error fetching auth users:", authError);
          // Continue anyway, just without emails
        }
        
        // Combine member data with emails
        const membersWithEmails = members.map(member => {
          const authUser = authUsers?.find(u => u.id === member.user_id);
          return {
            ...member,
            email: authUser?.email || null
          };
        });
        
        console.log("[useNeighborhoodMembers] Fetched members:", membersWithEmails.length);
        return membersWithEmails as NeighborhoodMember[];
      } catch (err) {
        console.error("[useNeighborhoodMembers] Error:", err);
        throw err;
      }
    },
    enabled: !!neighborhood?.id && !isLoadingNeighborhood,
  });
}

export default useNeighborhoodMembers;
