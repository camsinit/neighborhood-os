/**
 * Groups Service
 * 
 * Core service for managing groups functionality including:
 * - Group CRUD operations
 * - Membership management
 * - Invitations handling
 * - Physical unit management
 * - Validation and error handling
 */

import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import {
  Group,
  GroupMember,
  GroupInvitation,
  UserGroup,
  CreateGroupData,
  UpdateGroupFormData,
  JoinGroupData,
  InviteToGroupData,
  RespondToInvitationData,
  GetGroupsOptions,
  PhysicalUnitWithGroup,
  NeighborhoodPhysicalConfig,
  UpdateNeighborhoodPhysicalUnitsData,
  GroupError,
  GroupErrorCodes,
  GroupFilters,
  GroupSortOptions
} from '@/types/groups';

const logger = createLogger('GroupService');

export class GroupService {
  /**
   * Get all groups in a neighborhood with optional filtering
   */
  async getGroups(
    neighborhoodId: string, 
    options: GetGroupsOptions = {}
  ): Promise<Group[]> {
    logger.info('Fetching groups', { neighborhoodId, options });

    let query = supabase
      .from('groups')
      .select(`
        *,
        created_by_profile:profiles!groups_created_by_fkey(
          id, display_name, avatar_url
        ),
        member_count:group_members(count)
      `)
      .eq('neighborhood_id', neighborhoodId)
      .eq('status', 'active');

    // Apply filters
    if (options.groupType) {
      query = query.eq('group_type', options.groupType);
    }

    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    // Add current user membership info if requested
    if (options.includeCurrentUserMembership) {
      // This will be handled in a separate query to avoid complex joins
    }

    const { data, error } = await query.order('group_type', { ascending: true }).order('name', { ascending: true });

    if (error) {
      logger.error('Error fetching groups', { error, neighborhoodId });
      throw new GroupError('Failed to fetch groups', GroupErrorCodes.GROUP_NOT_FOUND);
    }

    // Enrich with current user membership if requested
    let enrichedGroups = data || [];
    if (options.includeCurrentUserMembership && enrichedGroups.length > 0) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const groupIds = enrichedGroups.map(g => g.id);
        const { data: memberships } = await supabase
          .from('group_members')
          .select('group_id, role, joined_at')
          .in('group_id', groupIds)
          .eq('user_id', user.id);

        if (memberships) {
          const membershipMap = new Map(memberships.map(m => [m.group_id, m]));
          enrichedGroups = enrichedGroups.map(group => ({
            ...group,
            current_user_membership: membershipMap.get(group.id)
          }));
        }
      }
    }

    logger.info('Successfully fetched groups', { count: enrichedGroups.length, neighborhoodId });
    return enrichedGroups;
  }

  /**
   * Get a single group by ID
   */
  async getGroup(groupId: string): Promise<Group> {
    logger.info('Fetching single group', { groupId });

    const { data, error } = await supabase
      .from('groups')
      .select(`
        *,
        created_by_profile:profiles!groups_created_by_fkey(
          id, display_name, avatar_url
        ),
        member_count:group_members(count)
      `)
      .eq('id', groupId)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      logger.error('Error fetching group', { error, groupId });
      throw new GroupError('Group not found', GroupErrorCodes.GROUP_NOT_FOUND, 404);
    }

    logger.info('Successfully fetched group', { groupId, groupName: data.name });
    return data;
  }

  /**
   * Create a new group
   */
  async createGroup(data: CreateGroupData): Promise<Group> {
    logger.info('Creating new group', { 
      name: data.name, 
      type: data.group_type, 
      neighborhoodId: data.neighborhood_id 
    });

    // Validation for physical groups
    if (data.group_type === 'physical') {
      if (!data.physical_unit_value) {
        throw new GroupError(
          'Physical unit is required for physical groups', 
          GroupErrorCodes.INVALID_PHYSICAL_UNIT
        );
      }

      // Check if physical group already exists for this unit
      const { data: existingGroup } = await supabase
        .from('groups')
        .select('id, name')
        .eq('neighborhood_id', data.neighborhood_id)
        .eq('group_type', 'physical')
        .eq('physical_unit_value', data.physical_unit_value)
        .eq('status', 'active')
        .maybeSingle();

      if (existingGroup) {
        throw new GroupError(
          `A physical group already exists for "${data.physical_unit_value}"`,
          GroupErrorCodes.DUPLICATE_PHYSICAL_UNIT
        );
      }

      // Validate that the physical unit is configured for this neighborhood
      await this.validatePhysicalUnit(data.neighborhood_id, data.physical_unit_value);
    }

    // Check for duplicate group names
    const { data: duplicateGroup } = await supabase
      .from('groups')
      .select('id')
      .eq('neighborhood_id', data.neighborhood_id)
      .eq('name', data.name)
      .eq('status', 'active')
      .maybeSingle();

    if (duplicateGroup) {
      throw new GroupError(
        'A group with this name already exists in your neighborhood',
        GroupErrorCodes.DUPLICATE_GROUP_NAME
      );
    }

    // Create the group
    const { data: newGroup, error } = await supabase
      .from('groups')
      .insert({
        neighborhood_id: data.neighborhood_id,
        name: data.name,
        description: data.description,
        group_type: data.group_type,
        physical_unit_value: data.physical_unit_value,
        created_by: data.created_by,
        is_private: data.is_private || false,
        max_members: data.max_members || 100
      })
      .select(`
        *,
        created_by_profile:profiles!groups_created_by_fkey(
          id, display_name, avatar_url
        )
      `)
      .single();

    if (error) {
      logger.error('Error creating group', { error, groupData: data });
      throw new GroupError('Failed to create group', GroupErrorCodes.PERMISSION_DENIED);
    }

    logger.info('Successfully created group', { 
      groupId: newGroup.id, 
      name: newGroup.name,
      type: newGroup.group_type 
    });

    // The database trigger will automatically add the creator as owner
    return { ...newGroup, member_count: 1 };
  }

  /**
   * Update an existing group
   */
  async updateGroup(groupId: string, updates: UpdateGroupFormData): Promise<Group> {
    logger.info('Updating group', { groupId, updates });

    const { data, error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', groupId)
      .select(`
        *,
        created_by_profile:profiles!groups_created_by_fkey(
          id, display_name, avatar_url
        ),
        member_count:group_members(count)
      `)
      .single();

    if (error) {
      logger.error('Error updating group', { error, groupId });
      throw new GroupError('Failed to update group', GroupErrorCodes.PERMISSION_DENIED);
    }

    logger.info('Successfully updated group', { groupId, name: data.name });
    return data;
  }

  /**
   * Delete a group (archive it)
   */
  async deleteGroup(groupId: string): Promise<void> {
    logger.info('Deleting group', { groupId });

    const { error } = await supabase
      .from('groups')
      .update({ status: 'archived' })
      .eq('id', groupId);

    if (error) {
      logger.error('Error deleting group', { error, groupId });
      throw new GroupError('Failed to delete group', GroupErrorCodes.PERMISSION_DENIED);
    }

    logger.info('Successfully archived group', { groupId });
  }

  /**
   * Get user's groups in a neighborhood
   */
  async getUserGroups(userId: string, neighborhoodId: string): Promise<UserGroup[]> {
    logger.info('Fetching user groups', { userId, neighborhoodId });

    const { data, error } = await supabase
      .from('group_members')
      .select(`
        role, joined_at,
        group:groups(
          id, name, group_type, physical_unit_value, description, 
          is_private, status, created_at,
          member_count:group_members(count)
        )
      `)
      .eq('user_id', userId)
      .eq('group.neighborhood_id', neighborhoodId)
      .eq('group.status', 'active')
      .order('joined_at', { ascending: false });

    if (error) {
      logger.error('Error fetching user groups', { error, userId, neighborhoodId });
      throw new GroupError('Failed to fetch user groups', GroupErrorCodes.PERMISSION_DENIED);
    }

    const userGroups = (data || [])
      .filter(item => item.group) // Filter out any null groups
      .map(item => ({
        role: item.role,
        joined_at: item.joined_at,
        group: item.group as Group
      }));

    logger.info('Successfully fetched user groups', { 
      count: userGroups.length, 
      userId, 
      neighborhoodId 
    });

    return userGroups;
  }

  /**
   * Get group members
   */
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    logger.info('Fetching group members', { groupId });

    const { data, error } = await supabase
      .from('group_members')
      .select(`
        *,
        profile:profiles(
          id, display_name, avatar_url
        )
      `)
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true });

    if (error) {
      logger.error('Error fetching group members', { error, groupId });
      throw new GroupError('Failed to fetch group members', GroupErrorCodes.PERMISSION_DENIED);
    }

    logger.info('Successfully fetched group members', { count: data?.length || 0, groupId });
    return data || [];
  }

  /**
   * Join a group
   */
  async joinGroup(data: JoinGroupData): Promise<void> {
    logger.info('User joining group', { groupId: data.group_id, userId: data.user_id });

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', data.group_id)
      .eq('user_id', data.user_id)
      .maybeSingle();

    if (existingMember) {
      throw new GroupError('You are already a member of this group', GroupErrorCodes.ALREADY_MEMBER);
    }

    // Check group capacity
    const { data: group } = await supabase
      .from('groups')
      .select('max_members, is_private, member_count:group_members(count)')
      .eq('id', data.group_id)
      .single();

    if (group?.member_count && group.member_count >= group.max_members) {
      throw new GroupError('This group has reached its maximum capacity', GroupErrorCodes.GROUP_FULL);
    }

    // For private groups, check if user has an accepted invitation
    if (group?.is_private) {
      const { data: invitation } = await supabase
        .from('group_invitations')
        .select('id, status')
        .eq('group_id', data.group_id)
        .eq('invitee_id', data.user_id)
        .eq('status', 'accepted')
        .maybeSingle();

      if (!invitation) {
        throw new GroupError('You need an invitation to join this private group', GroupErrorCodes.PERMISSION_DENIED);
      }
    }

    // Add user to group
    const { error } = await supabase
      .from('group_members')
      .insert({
        group_id: data.group_id,
        user_id: data.user_id,
        role: 'member',
        invited_by: data.invited_by
      });

    if (error) {
      logger.error('Error joining group', { error, data });
      throw new GroupError('Failed to join group', GroupErrorCodes.PERMISSION_DENIED);
    }

    logger.info('Successfully joined group', { groupId: data.group_id, userId: data.user_id });
  }

  /**
   * Leave a group
   */
  async leaveGroup(groupId: string, userId: string): Promise<void> {
    logger.info('User leaving group', { groupId, userId });

    // Check if user is the owner
    const { data: membership } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (!membership) {
      throw new GroupError('You are not a member of this group', GroupErrorCodes.PERMISSION_DENIED);
    }

    if (membership.role === 'owner') {
      // Check if there are other members who can become owner
      const { data: otherMembers } = await supabase
        .from('group_members')
        .select('user_id, role')
        .eq('group_id', groupId)
        .neq('user_id', userId);

      if (otherMembers && otherMembers.length > 0) {
        // Transfer ownership to the oldest moderator, or oldest member if no moderators
        const moderators = otherMembers.filter(m => m.role === 'moderator');
        const newOwnerId = moderators.length > 0 ? moderators[0].user_id : otherMembers[0].user_id;

        await supabase
          .from('group_members')
          .update({ role: 'owner' })
          .eq('group_id', groupId)
          .eq('user_id', newOwnerId);
      } else {
        // Archive the group if no other members
        await supabase
          .from('groups')
          .update({ status: 'archived' })
          .eq('id', groupId);
      }
    }

    // Remove user from group
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) {
      logger.error('Error leaving group', { error, groupId, userId });
      throw new GroupError('Failed to leave group', GroupErrorCodes.PERMISSION_DENIED);
    }

    logger.info('Successfully left group', { groupId, userId });
  }

  /**
   * Get physical units with associated groups for a neighborhood
   */
  async getPhysicalUnitsWithGroups(neighborhoodId: string): Promise<PhysicalUnitWithGroup[]> {
    logger.info('Fetching physical units with groups', { neighborhoodId });

    // Get neighborhood configuration
    const { data: neighborhood, error: neighborhoodError } = await supabase
      .from('neighborhoods')
      .select('physical_unit_type, physical_unit_label, physical_units')
      .eq('id', neighborhoodId)
      .single();

    if (neighborhoodError || !neighborhood) {
      logger.error('Error fetching neighborhood config', { error: neighborhoodError, neighborhoodId });
      throw new GroupError('Neighborhood not found', GroupErrorCodes.GROUP_NOT_FOUND, 404);
    }

    if (!neighborhood.physical_units || !Array.isArray(neighborhood.physical_units)) {
      return [];
    }

    // Get existing physical groups
    const { data: groups } = await supabase
      .from('groups')
      .select(`
        *,
        member_count:group_members(count)
      `)
      .eq('neighborhood_id', neighborhoodId)
      .eq('group_type', 'physical')
      .eq('status', 'active');

    // Map units to groups
    const unitsWithGroups: PhysicalUnitWithGroup[] = neighborhood.physical_units.map(unit => ({
      unit_name: unit,
      unit_label: neighborhood.physical_unit_label || 'Unit',
      group: groups?.find(g => g.physical_unit_value === unit) || null
    }));

    logger.info('Successfully fetched physical units with groups', { 
      count: unitsWithGroups.length, 
      neighborhoodId 
    });

    return unitsWithGroups;
  }

  /**
   * Update neighborhood physical unit configuration
   */
  async updateNeighborhoodPhysicalUnits(data: UpdateNeighborhoodPhysicalUnitsData): Promise<void> {
    logger.info('Updating neighborhood physical units', { 
      neighborhoodId: data.neighborhood_id,
      unitType: data.physical_unit_type,
      unitCount: data.physical_units.length
    });

    const { error } = await supabase
      .from('neighborhoods')
      .update({
        physical_unit_type: data.physical_unit_type,
        physical_unit_label: data.physical_unit_label,
        physical_units: data.physical_units
      })
      .eq('id', data.neighborhood_id);

    if (error) {
      logger.error('Error updating physical units', { error, data });
      throw new GroupError('Failed to update physical units configuration', GroupErrorCodes.PERMISSION_DENIED);
    }

    logger.info('Successfully updated neighborhood physical units', { neighborhoodId: data.neighborhood_id });
  }

  /**
   * Get neighborhood physical configuration
   */
  async getNeighborhoodPhysicalConfig(neighborhoodId: string): Promise<NeighborhoodPhysicalConfig> {
    logger.info('Fetching neighborhood physical config', { neighborhoodId });

    const { data, error } = await supabase
      .from('neighborhoods')
      .select('physical_unit_type, physical_unit_label, physical_units')
      .eq('id', neighborhoodId)
      .single();

    if (error || !data) {
      logger.error('Error fetching neighborhood config', { error, neighborhoodId });
      throw new GroupError('Neighborhood not found', GroupErrorCodes.GROUP_NOT_FOUND, 404);
    }

    const config: NeighborhoodPhysicalConfig = {
      physical_unit_type: data.physical_unit_type || 'street',
      physical_unit_label: data.physical_unit_label || 'Street',
      physical_units: data.physical_units || []
    };

    logger.info('Successfully fetched neighborhood physical config', { neighborhoodId, config });
    return config;
  }

  /**
   * Validate that a physical unit is available in a neighborhood
   */
  private async validatePhysicalUnit(neighborhoodId: string, unitValue: string): Promise<void> {
    const config = await this.getNeighborhoodPhysicalConfig(neighborhoodId);
    
    if (!config.physical_units.includes(unitValue)) {
      throw new GroupError(
        `Physical unit "${unitValue}" is not configured for this neighborhood. Available units: ${config.physical_units.join(', ')}`,
        GroupErrorCodes.INVALID_PHYSICAL_UNIT
      );
    }
  }
}

// Export singleton instance
export const groupService = new GroupService();
export default groupService;