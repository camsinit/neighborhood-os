/**
 * Hook to get all members of the current neighborhood with their roles
 * 
 * This hook fetches the complete member directory including:
 * - Basic profile information (display_name, avatar_url, etc.)
 * - Contact information (respecting privacy settings)
 * - Neighborhood role (admin, steward, neighbor)
 * - Membership status and join date
 * 
 * Only accessible to admins and stewards of the neighborhood.
 */

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { useNeighborhood } from '@/contexts/neighborhood';
import { useCanAccessAdminPage } from './useCanAccessAdminPage';

export interface NeighborhoodMember {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  email?: string | null;
  phone_number?: string | null;
  address?: string | null;
  access_needs?: string | null;
  bio?: string | null;
  email_visible: boolean;
  phone_visible: boolean;
  address_visible: boolean;
  needs_visible: boolean;
  joined_at: string;
  neighborhood_role: 'admin' | 'steward' | 'neighbor';
}

export function useNeighborhoodMembers() {
  const user = useUser();
  const { currentNeighborhood } = useNeighborhood();
  const { canAccess } = useCanAccessAdminPage();
  
  return useQuery({
    queryKey: ['neighborhood-members', currentNeighborhood?.id],
    queryFn: async () => {
      if (!currentNeighborhood?.id || !canAccess) {
        return [];
      }

      try {
        // Get all neighborhood members
        const { data: members, error: membersError } = await supabase
          .from('neighborhood_members')
          .select('user_id, joined_at')
          .eq('neighborhood_id', currentNeighborhood.id)
          .eq('status', 'active');

        if (membersError) {
          console.error('Error fetching neighborhood members:', membersError);
          return [];
        }

        if (!members || members.length === 0) {
          return [];
        }

        // Get profiles for all member user IDs
        const userIds = members.map(m => m.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            id,
            display_name,
            avatar_url,
            email_visible,
            phone_visible,
            address_visible,
            needs_visible,
            phone_number,
            address,
            access_needs,
            bio
          `)
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          return [];
        }

        // Get neighborhood roles for all members
        const { data: roles, error: rolesError } = await supabase
          .from('neighborhood_roles')
          .select('user_id, role')
          .eq('neighborhood_id', currentNeighborhood.id);

        if (rolesError) {
          console.error('Error fetching neighborhood roles:', rolesError);
        }

        // Get neighborhood creator info
        const { data: neighborhood } = await supabase
          .from('neighborhoods')
          .select('created_by')
          .eq('id', currentNeighborhood.id)
          .single();

        // Combine the data and determine roles
        const membersWithRoles: NeighborhoodMember[] = members.map(member => {
          // Find the profile for this member
          const profile = profiles?.find(p => p.id === member.user_id);
          
          // Determine role: creator is admin, check explicit roles, default to neighbor
          let role: 'admin' | 'steward' | 'neighbor' = 'neighbor';
          
          if (neighborhood?.created_by === member.user_id) {
            role = 'admin';
          } else {
            const explicitRole = roles?.find(r => r.user_id === member.user_id);
            if (explicitRole) {
              role = explicitRole.role as 'admin' | 'steward';
            }
          }

          return {
            user_id: member.user_id,
            display_name: profile?.display_name || null,
            avatar_url: profile?.avatar_url || null,
            email_visible: profile?.email_visible || false,
            phone_visible: profile?.phone_visible || false,
            address_visible: profile?.address_visible || false,
            needs_visible: profile?.needs_visible || false,
            phone_number: profile?.phone_number || null,
            address: profile?.address || null,
            access_needs: profile?.access_needs || null,
            bio: profile?.bio || null,
            joined_at: member.joined_at,
            neighborhood_role: role
          };
        });

        // Sort by role (admin first, then stewards, then neighbors) and then by name
        return membersWithRoles.sort((a, b) => {
          // Sort by role priority first
          const roleOrder = { admin: 0, steward: 1, neighbor: 2 };
          const roleComparison = roleOrder[a.neighborhood_role] - roleOrder[b.neighborhood_role];
          
          if (roleComparison !== 0) {
            return roleComparison;
          }
          
          // Then sort by display name
          const nameA = a.display_name || 'Unknown';
          const nameB = b.display_name || 'Unknown';
          return nameA.localeCompare(nameB);
        });

      } catch (error) {
        console.error('Error in useNeighborhoodMembers:', error);
        return [];
      }
    },
    enabled: !!user?.id && !!currentNeighborhood?.id && canAccess,
    staleTime: 2 * 60 * 1000, // 2 minutes - member data changes occasionally
  });
}