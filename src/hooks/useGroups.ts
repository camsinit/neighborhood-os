/**
 * Groups React Query Hooks
 * 
 * Custom hooks for managing groups data with React Query
 * Includes caching, real-time updates, and optimistic mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentNeighborhood } from '@/hooks/useCurrentNeighborhood';
import { groupService } from '@/services/groupService';
import { createLogger } from '@/utils/logger';
import {
  Group,
  GroupMember,
  UserGroup,
  CreateGroupData,
  UpdateGroupFormData,
  JoinGroupData,
  GetGroupsOptions,
  PhysicalUnitWithGroup,
  NeighborhoodPhysicalConfig,
  UpdateNeighborhoodPhysicalUnitsData,
  GroupError
} from '@/types/groups';
import { useEffect } from 'react';

const logger = createLogger('useGroups');

// Query keys for consistent caching
export const groupQueryKeys = {
  all: ['groups'] as const,
  neighborhoods: (neighborhoodId: string) => ['groups', 'neighborhood', neighborhoodId] as const,
  neighborhood: (neighborhoodId: string, options?: GetGroupsOptions) => 
    ['groups', 'neighborhood', neighborhoodId, options] as const,
  group: (groupId: string) => ['groups', 'group', groupId] as const,
  members: (groupId: string) => ['groups', 'members', groupId] as const,
  userGroups: (userId: string, neighborhoodId: string) => 
    ['groups', 'user', userId, neighborhoodId] as const,
  physicalUnits: (neighborhoodId: string) => 
    ['groups', 'physicalUnits', neighborhoodId] as const,
  neighborhoodConfig: (neighborhoodId: string) => 
    ['groups', 'neighborhoodConfig', neighborhoodId] as const,
};

/**
 * Get all groups in current neighborhood with optional filtering
 */
export const useGroups = (options: GetGroupsOptions = {}) => {
  const neighborhood = useCurrentNeighborhood();
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: groupQueryKeys.neighborhood(neighborhood?.id || '', options),
    queryFn: async () => {
      try {
        return await groupService.getGroups(neighborhood?.id || '', options);
      } catch (error) {
        // If groups table doesn't exist or any groups-related database error, return empty array
        logger.warn('Groups table not available, returning empty array', { error });
        return [];
      }
    },
    enabled: !!neighborhood?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: false, // Don't retry when tables don't exist
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!neighborhood?.id) return;

    const channel = supabase
      .channel(`groups-${neighborhood.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'groups',
          filter: `neighborhood_id=eq.${neighborhood.id}`
        },
        (payload) => {
          logger.info('Groups real-time update', { event: payload.eventType, payload });
          
          // Invalidate and refetch groups queries
          queryClient.invalidateQueries({
            queryKey: groupQueryKeys.neighborhoods(neighborhood.id)
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_members'
        },
        (payload) => {
          logger.info('Group members real-time update', { event: payload.eventType, payload });
          
          // Invalidate affected queries
          queryClient.invalidateQueries({
            queryKey: groupQueryKeys.neighborhoods(neighborhood.id)
          });
          
          if ((payload.new as any)?.group_id || (payload.old as any)?.group_id) {
            const groupId = (payload.new as any)?.group_id || (payload.old as any)?.group_id;
            queryClient.invalidateQueries({
              queryKey: groupQueryKeys.members(groupId)
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [neighborhood?.id, queryClient]);

  return query;
};

/**
 * Get a single group by ID
 */
export const useGroup = (groupId?: string) => {
  return useQuery({
    queryKey: groupQueryKeys.group(groupId || ''),
    queryFn: () => groupService.getGroup(groupId!),
    enabled: !!groupId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get group members
 */
export const useGroupMembers = (groupId?: string) => {
  return useQuery({
    queryKey: groupQueryKeys.members(groupId || ''),
    queryFn: () => groupService.getGroupMembers(groupId!),
    enabled: !!groupId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Get current user's groups in current neighborhood
 */
export const useUserGroups = () => {
  const neighborhood = useCurrentNeighborhood();
  
  return useQuery({
    queryKey: ['user-groups', neighborhood?.id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !neighborhood?.id) return [];
      
      return groupService.getUserGroups(user.id, neighborhood.id);
    },
    enabled: !!neighborhood?.id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get physical units with associated groups
 */
export const usePhysicalUnitsWithGroups = () => {
  const neighborhood = useCurrentNeighborhood();
  
  return useQuery({
    queryKey: groupQueryKeys.physicalUnits(neighborhood?.id || ''),
    queryFn: () => groupService.getPhysicalUnitsWithGroups(neighborhood?.id || ''),
    enabled: !!neighborhood?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Get physical units with assigned residents  
 * Now using group membership instead of physical_unit_value assignments
 */
export const usePhysicalUnitsWithResidents = () => {
  const neighborhood = useCurrentNeighborhood();
  
  return useQuery({
    queryKey: ['physicalUnitsWithResidents', neighborhood?.id],
    queryFn: async () => {
      if (!neighborhood?.id) return [];
      
      try {
        // Get neighborhood config first - this is our source of truth
        const config = await groupService.getNeighborhoodPhysicalConfig(neighborhood.id);
        
        // If no physical units configured, return empty array
        if (!config.physical_units || config.physical_units.length === 0) {
          return [];
        }

        // Get all physical groups for this neighborhood with member counts
        const { data: physicalGroups, error } = await supabase
          .from('groups')
          .select(`
            *,
            member_count:group_members(count)
          `)
          .eq('neighborhood_id', neighborhood.id)
          .eq('group_type', 'physical')
          .eq('status', 'active');

        if (error) {
          console.error('Error fetching physical groups:', error);
          // Still return units even if groups query fails
        }

        // Create a map of physical unit to member count
        const memberCountMap = new Map<string, number>();
        console.log('Physical groups from DB:', physicalGroups);
        console.log('Configured physical units:', config.physical_units);
        
        physicalGroups?.forEach(group => {
          if (group.physical_unit_value) {
            // Fix: Extract the actual count from the aggregate query result
            const memberCount = Array.isArray(group.member_count) && group.member_count.length > 0 
              ? group.member_count[0]?.count || 0 
              : 0;
            
            console.log(`Group "${group.name}" (${group.physical_unit_value}): ${memberCount} members`);
            
            // Only count groups that match configured physical units exactly
            if (config.physical_units.includes(group.physical_unit_value)) {
              const currentCount = memberCountMap.get(group.physical_unit_value) || 0;
              memberCountMap.set(group.physical_unit_value, currentCount + memberCount);
            } else {
              console.warn(`Group physical_unit_value "${group.physical_unit_value}" doesn't match any configured unit`);
            }
          }
        });
        
        console.log('Final member count map:', Object.fromEntries(memberCountMap));

        // Create result using ALL configured physical units
        const unitsWithResidents = config.physical_units.map(unit => ({
          unit_name: unit,
          unit_label: config.physical_unit_label,
          residents: [], // Simplified - not showing individual resident details for now
          resident_count: memberCountMap.get(unit) || 0
        }));

        return unitsWithResidents;
      } catch (error) {
        console.error('Error fetching physical units with residents:', error);
        // Return empty array on error
        return [];
      }
    },
    enabled: !!neighborhood?.id,
    staleTime: 0, // Always consider data stale to ensure fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  });
};

/**
 * Get neighborhood physical configuration
 */
export const useNeighborhoodPhysicalConfig = () => {
  const neighborhood = useCurrentNeighborhood();
  
  return useQuery({
    queryKey: groupQueryKeys.neighborhoodConfig(neighborhood?.id || ''),
    queryFn: async () => {
      try {
        return await groupService.getNeighborhoodPhysicalConfig(neighborhood?.id || '');
      } catch (error) {
        // If groups features aren't set up, return default config
        logger.warn('Physical units config not available, returning defaults', { error });
        return {
          physical_unit_type: 'street' as const,
          physical_unit_label: 'Street',
          physical_units: []
        };
      }
    },
    enabled: !!neighborhood?.id,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: false, // Don't retry when columns don't exist
  });
};

/**
 * Create a new group
 */
export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  const neighborhood = useCurrentNeighborhood();
  
  return useMutation({
    mutationFn: async (data: Omit<CreateGroupData, 'neighborhood_id' | 'created_by'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !neighborhood?.id) {
        throw new Error('User not authenticated or no neighborhood selected');
      }
      
      return groupService.createGroup({
        ...data,
        neighborhood_id: neighborhood.id,
        created_by: user.id
      });
    },
    
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: groupQueryKeys.neighborhoods(neighborhood?.id || '')
      });
      
      // Snapshot previous value
      const previousGroups = queryClient.getQueryData(
        groupQueryKeys.neighborhood(neighborhood?.id || '', {})
      );
      
      // Optimistically add new group
      if (neighborhood?.id && previousGroups) {
        const optimisticGroup: Group = {
          id: 'temp-' + Date.now(),
          neighborhood_id: neighborhood.id,
          name: data.name,
          description: data.description,
          group_type: data.group_type,
          physical_unit_value: data.physical_unit_value,
          created_by: 'temp-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'active',
          max_members: data.max_members || 100,
          is_private: data.is_private || false,
          member_count: 1,
        };
        
        queryClient.setQueryData(
          groupQueryKeys.neighborhood(neighborhood.id, {}),
          (old: Group[]) => [...(old || []), optimisticGroup]
        );
      }
      
      return { previousGroups };
    },
    
    onSuccess: (newGroup) => {
      // Invalidate and refetch groups
      if (neighborhood?.id) {
        queryClient.invalidateQueries({
          queryKey: groupQueryKeys.neighborhoods(neighborhood.id)
        });
        
        // Update user groups cache
        queryClient.invalidateQueries({
          queryKey: ['user-groups', neighborhood.id]
        });
        
        // If it's a physical group, invalidate physical units
        if (newGroup.group_type === 'physical') {
          queryClient.invalidateQueries({
            queryKey: groupQueryKeys.physicalUnits(neighborhood.id)
          });
        }
      }
      
      // Only show success toast for non-physical groups or manual creation
      if (newGroup.group_type !== 'physical') {
        toast.success(`Group "${newGroup.name}" created successfully!`);
      }
    },
    
    onError: (error: unknown, variables, context) => {
      // Revert optimistic update
      if (context?.previousGroups && neighborhood?.id) {
        queryClient.setQueryData(
          groupQueryKeys.neighborhood(neighborhood.id, {}),
          context.previousGroups
        );
      }
      
      const message = error instanceof GroupError ? error.message : 'Failed to create group';
      toast.error(message);
      logger.error('Error creating group', { error, variables });
    },
    
    onSettled: () => {
      // Refetch to ensure consistency
      if (neighborhood?.id) {
        queryClient.invalidateQueries({
          queryKey: groupQueryKeys.neighborhoods(neighborhood.id)
        });
      }
    }
  });
};

/**
 * Update an existing group
 */
export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  const neighborhood = useCurrentNeighborhood();
  
  return useMutation({
    mutationFn: ({ groupId, updates }: { groupId: string; updates: UpdateGroupFormData }) =>
      groupService.updateGroup(groupId, updates),
    
    onSuccess: (updatedGroup) => {
      // Update specific group cache
      queryClient.setQueryData(
        groupQueryKeys.group(updatedGroup.id),
        updatedGroup
      );
      
      // Invalidate groups lists
      if (neighborhood?.id) {
        queryClient.invalidateQueries({
          queryKey: groupQueryKeys.neighborhoods(neighborhood.id)
        });
      }
      
      toast.success(`Group "${updatedGroup.name}" updated successfully!`);
    },
    
    onError: (error: unknown) => {
      const message = error instanceof GroupError ? error.message : 'Failed to update group';
      toast.error(message);
      logger.error('Error updating group', { error });
    }
  });
};

/**
 * Join a group
 */
export const useJoinGroup = () => {
  const queryClient = useQueryClient();
  const neighborhood = useCurrentNeighborhood();
  
  return useMutation({
    mutationFn: async (groupId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const joinData: JoinGroupData = {
        group_id: groupId,
        user_id: user.id
      };
      
      return groupService.joinGroup(joinData);
    },
    
    onMutate: async (groupId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: groupQueryKeys.neighborhoods(neighborhood?.id || '')
      });
      
      // Get current user for optimistic updates
      const { data: { user } } = await supabase.auth.getUser();
      
      // Optimistically update member count and membership status
      const previousGroups = queryClient.getQueryData(
        groupQueryKeys.neighborhood(neighborhood?.id || '', {})
      ) as Group[] || [];
      
      const updatedGroups = previousGroups.map(group =>
        group.id === groupId
          ? { 
              ...group, 
              member_count: (group.member_count || 0) + 1,
              // Add current user membership for immediate button state change
              current_user_membership: user ? {
                role: 'member',
                joined_at: new Date().toISOString()
              } : null
            }
          : group
      );
      
      queryClient.setQueryData(
        groupQueryKeys.neighborhood(neighborhood?.id || '', {}),
        updatedGroups
      );
      
      return { previousGroups };
    },
    
    onSuccess: (_, groupId) => {
      // Invalidate affected queries
      if (neighborhood?.id) {
        queryClient.invalidateQueries({
          queryKey: groupQueryKeys.neighborhoods(neighborhood.id)
        });
        queryClient.invalidateQueries({
          queryKey: ['user-groups', neighborhood.id]
        });
        queryClient.invalidateQueries({
          queryKey: groupQueryKeys.members(groupId)
        });
        // Invalidate physical units data to update neighbor counts
        queryClient.invalidateQueries({
          queryKey: ['physicalUnitsWithResidents', neighborhood.id]
        });
      }
      
      toast.success('Successfully joined group!');
    },
    
    onError: (error: unknown, groupId, context) => {
      // Revert optimistic update
      if (context?.previousGroups && neighborhood?.id) {
        queryClient.setQueryData(
          groupQueryKeys.neighborhood(neighborhood.id, {}),
          context.previousGroups
        );
      }
      
      const message = error instanceof GroupError ? error.message : 'Failed to join group';
      toast.error(message);
      logger.error('Error joining group', { error, groupId });
    }
  });
};

/**
 * Leave a group
 */
export const useLeaveGroup = () => {
  const queryClient = useQueryClient();
  const neighborhood = useCurrentNeighborhood();
  
  return useMutation({
    mutationFn: async (groupId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      return groupService.leaveGroup(groupId, user.id);
    },
    
    onMutate: async (groupId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: groupQueryKeys.neighborhoods(neighborhood?.id || '')
      });
      
      // Optimistically update member count and membership status
      const previousGroups = queryClient.getQueryData(
        groupQueryKeys.neighborhood(neighborhood?.id || '', {})
      ) as Group[] || [];
      
      const updatedGroups = previousGroups.map(group =>
        group.id === groupId
          ? { 
              ...group, 
              member_count: Math.max((group.member_count || 1) - 1, 0),
              // Remove current user membership for immediate button state change
              current_user_membership: null
            }
          : group
      );
      
      queryClient.setQueryData(
        groupQueryKeys.neighborhood(neighborhood?.id || '', {}),
        updatedGroups
      );
      
      return { previousGroups };
    },
    
    onSuccess: (_, groupId) => {
      // Invalidate affected queries
      if (neighborhood?.id) {
        queryClient.invalidateQueries({
          queryKey: groupQueryKeys.neighborhoods(neighborhood.id)
        });
        queryClient.invalidateQueries({
          queryKey: ['user-groups', neighborhood.id]
        });
        queryClient.invalidateQueries({
          queryKey: groupQueryKeys.members(groupId)
        });
        // Invalidate physical units data to update neighbor counts
        queryClient.invalidateQueries({
          queryKey: ['physicalUnitsWithResidents', neighborhood.id]
        });
      }
      
      toast.success('Successfully left group');
    },
    
    onError: (error: unknown, groupId, context) => {
      // Revert optimistic update
      if (context?.previousGroups && neighborhood?.id) {
        queryClient.setQueryData(
          groupQueryKeys.neighborhood(neighborhood.id, {}),
          context.previousGroups
        );
      }
      
      const message = error instanceof GroupError ? error.message : 'Failed to leave group';
      toast.error(message);
      logger.error('Error leaving group', { error, groupId });
    }
  });
};

/**
 * Delete a group
 */
export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  const neighborhood = useCurrentNeighborhood();
  
  return useMutation({
    mutationFn: (groupId: string) => groupService.deleteGroup(groupId),
    
    onSuccess: (_, groupId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: groupQueryKeys.group(groupId)
      });
      
      // Invalidate groups lists
      if (neighborhood?.id) {
        queryClient.invalidateQueries({
          queryKey: groupQueryKeys.neighborhoods(neighborhood.id)
        });
        queryClient.invalidateQueries({
          queryKey: ['user-groups', neighborhood.id]
        });
        queryClient.invalidateQueries({
          queryKey: groupQueryKeys.physicalUnits(neighborhood.id)
        });
      }
      
      toast.success('Group deleted successfully');
    },
    
    onError: (error: unknown) => {
      const message = error instanceof GroupError ? error.message : 'Failed to delete group';
      toast.error(message);
      logger.error('Error deleting group', { error });
    }
  });
};

/**
 * Update neighborhood physical units configuration
 */
export const useUpdateNeighborhoodPhysicalUnits = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateNeighborhoodPhysicalUnitsData) =>
      groupService.updateNeighborhoodPhysicalUnits(data),
    
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: groupQueryKeys.neighborhoodConfig(variables.neighborhood_id)
      });
      queryClient.invalidateQueries({
        queryKey: groupQueryKeys.physicalUnits(variables.neighborhood_id)
      });
      queryClient.invalidateQueries({
        queryKey: groupQueryKeys.neighborhoods(variables.neighborhood_id)
      });
      
      toast.success('Physical units configuration updated successfully');
    },
    
    onError: (error: unknown) => {
      const message = error instanceof GroupError ? error.message : 'Failed to update configuration';
      toast.error(message);
      logger.error('Error updating physical units config', { error });
    }
  });
};