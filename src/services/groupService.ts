/**
 * Groups Service - Working Implementation
 * 
 * Core service for managing groups functionality including:
 * - Group CRUD operations
 * - Membership management
 * - Physical unit validation
 */

import { supabase } from '@/integrations/supabase/client';
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
  GroupError,
  GroupErrorCodes,
  PhysicalUnitType
} from '@/types/groups';

const logger = createLogger('GroupService');

export class GroupService {
  /**
   * Get all groups in a neighborhood with optional filtering
   * Now includes current user membership status and actual member count
   */
  async getGroups(
    neighborhoodId: string, 
    options: GetGroupsOptions = {}
  ): Promise<Group[]> {
    logger.info('Fetching groups', { neighborhoodId, options });

    try {
      // Get current user ID for membership check
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      // Build query with member count and current user membership
      let query = (supabase as any)
        .from('groups')
        .select(`
          *,
          member_count:group_members(count),
          current_user_membership:group_members!left(role, joined_at)
        `)
        .eq('neighborhood_id', neighborhoodId)
        .eq('status', 'active');

      // Filter for current user membership if user is logged in
      if (currentUserId) {
        query = query.eq('current_user_membership.user_id', currentUserId);
      }

      // Apply filters
      if (options.groupType) {
        query = query.eq('group_type', options.groupType);
      }

      if (options.search) {
        query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
      }

      const { data, error } = await query.order('group_type', { ascending: true }).order('name', { ascending: true });

      if (error) {
        logger.error('Error fetching groups', { error, neighborhoodId });
        throw new GroupError('Failed to fetch groups', GroupErrorCodes.GROUP_NOT_FOUND);
      }

      // Transform the data to handle the nested structure
      const groups: Group[] = (data || []).map((group: any) => ({
        ...group,
        member_count: Array.isArray(group.member_count) ? group.member_count.length : 0,
        current_user_membership: Array.isArray(group.current_user_membership) && group.current_user_membership.length > 0 
          ? group.current_user_membership[0] 
          : null
      }));

      logger.info('Successfully fetched groups', { count: groups.length, neighborhoodId });
      return groups;
    } catch (error) {
      logger.error('Error in getGroups', { error, neighborhoodId });
      throw error;
    }
  }

  /**
   * Get a single group by ID
   */
  async getGroup(groupId: string): Promise<Group> {
    logger.info('Fetching single group', { groupId });

    const { data, error } = await (supabase as any)
      .from('groups')
      .select('*')
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
    logger.info('=== STARTING GROUP CREATION ===', { 
      name: data.name, 
      type: data.group_type, 
      neighborhoodId: data.neighborhood_id,
      createdBy: data.created_by,
      isPrivate: data.is_private,
      maxMembers: data.max_members,
      physicalUnitValue: data.physical_unit_value
    });

    try {
      // Step 1: Check for duplicate group names
      logger.info('Checking for duplicate group name');
      const { data: duplicateGroup, error: duplicateError } = await (supabase as any)
        .from('groups')
        .select('id')
        .eq('neighborhood_id', data.neighborhood_id)
        .eq('name', data.name)
        .eq('status', 'active')
        .maybeSingle();

      if (duplicateError) {
        logger.error('Error checking for duplicate group name:', duplicateError);
      }

      if (duplicateGroup) {
        logger.error('Duplicate group name found:', data.name);
        throw new GroupError(
          'A group with this name already exists in your neighborhood',
          GroupErrorCodes.DUPLICATE_GROUP_NAME
        );
      }

      // Step 2: Prepare insert data
      logger.info('Preparing insert data');
      const insertData = {
        neighborhood_id: data.neighborhood_id,
        name: data.name,
        description: data.description,
        group_type: data.group_type,
        physical_unit_value: data.physical_unit_value,
        created_by: data.created_by,
        is_private: data.is_private || false,
        max_members: data.max_members || 100
      };
      logger.info('Insert data prepared:', insertData);

      // Step 3: Create the group
      logger.info('Inserting group into database');
      const { data: newGroup, error } = await (supabase as any)
        .from('groups')
        .insert(insertData)
        .select('*')
        .single();

      if (error) {
        logger.error('=== GROUP CREATION FAILED ===', { 
          error: {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          }, 
          groupData: data,
          insertData: insertData
        });
        throw new GroupError('Failed to create group', GroupErrorCodes.PERMISSION_DENIED);
      }

      logger.info('=== GROUP CREATION SUCCESSFUL ===', { 
        groupId: newGroup.id, 
        name: newGroup.name,
        type: newGroup.group_type,
        createdBy: newGroup.created_by,
        createdAt: newGroup.created_at
      });

      // Step 4: Send invitations to selected neighbors
      if (data.invited_neighbors && data.invited_neighbors.length > 0) {
        logger.info('Sending group invitations', { 
          groupId: newGroup.id,
          invitedCount: data.invited_neighbors.length 
        });

        try {
          // Import the notification service
          const { createGroupInvitationNotifications } = await import('@/utils/notifications/templatedNotificationService');
          
          // Get the creator's display name
          const { data: creatorProfile } = await (supabase as any)
            .from('profiles')
            .select('display_name')
            .eq('id', data.created_by)
            .single();

          const creatorName = creatorProfile?.display_name || 'A neighbor';

          // Send invitation notifications
          await createGroupInvitationNotifications(
            newGroup.id,
            newGroup.name,
            data.created_by,
            creatorName,
            data.invited_neighbors
          );

          logger.info('Group invitations sent successfully', { 
            groupId: newGroup.id,
            invitedCount: data.invited_neighbors.length 
          });
        } catch (inviteError) {
          logger.error('Error sending group invitations', { 
            error: inviteError, 
            groupId: newGroup.id 
          });
          // Don't fail group creation if invitations fail
        }
      }

      return { ...newGroup, member_count: 1 };
    } catch (error) {
      logger.error('=== GROUP CREATION EXCEPTION ===', { 
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        groupData: data
      });
      throw error;
    }
  }

  /**
   * Update an existing group
   */
  async updateGroup(groupId: string, updates: UpdateGroupFormData): Promise<Group> {
    logger.info('Updating group', { groupId, updates });

    const { data, error } = await (supabase as any)
      .from('groups')
      .update(updates)
      .eq('id', groupId)
      .select('*')
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

    const { error } = await (supabase as any)
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

    const { data, error } = await (supabase as any)
      .from('group_members')
      .select('role, joined_at, group_id')
      .eq('user_id', userId);

    if (error) {
      logger.error('Error fetching user groups', { error, userId, neighborhoodId });
      return [];
    }

    // Fetch group details for each membership
    const userGroups: UserGroup[] = [];
    for (const membership of data || []) {
      try {
        const { data: groupData } = await (supabase as any)
          .from('groups')
          .select('*')
          .eq('id', membership.group_id)
          .eq('neighborhood_id', neighborhoodId)
          .eq('status', 'active')
          .single();

        if (groupData) {
          userGroups.push({
            role: membership.role,
            joined_at: membership.joined_at,
            group: groupData
          });
        }
      } catch (error) {
        logger.warn('Error fetching group details', { error, groupId: membership.group_id });
      }
    }

    logger.info('Successfully fetched user groups', { 
      count: userGroups.length, 
      userId, 
      neighborhoodId 
    });

    return userGroups;
  }

  /**
   * Get group members with profile information
   */
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    logger.info('Fetching group members', { groupId });

    // First get group members, then get their profiles separately
    const { data: membersData, error: membersError } = await (supabase as any)
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true });

    if (membersError) {
      logger.error('[GroupService] Error fetching group members', { error: membersError, groupId });
      return [];
    }

    if (!membersData || membersData.length === 0) {
      logger.info('No members found for group', { groupId });
      return [];
    }
    // Get user IDs to fetch their profiles
    const userIds = membersData.map(member => member.user_id);
    
    // Fetch profiles for all users
    const { data: profilesData, error: profilesError } = await (supabase as any)
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', userIds);

    if (profilesError) {
      logger.error('[GroupService] Error fetching profiles', { error: profilesError, groupId });
      // Continue without profiles rather than failing completely
    }

    // Create a map of user_id to profile for easy lookup
    const profilesMap = new Map();
    if (profilesData) {
      profilesData.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
    }

    // Transform the data to match GroupMember interface
    const members = membersData.map((member: any) => ({
      id: member.id,
      user_id: member.user_id,
      group_id: member.group_id,
      role: member.role,
      joined_at: member.joined_at,
      invited_by: member.invited_by,
      profile: profilesMap.get(member.user_id) || null
    }));

    logger.info('Successfully fetched group members with profiles', { count: members.length, groupId });
    return members;
  }

  /**
   * Join a group
   */
  async joinGroup(data: JoinGroupData): Promise<void> {
    logger.info('=== GROUP JOIN STARTED ===', { groupId: data.group_id, userId: data.user_id });

    // Check if user is already a member
    const { data: existingMember } = await (supabase as any)
      .from('group_members')
      .select('id')
      .eq('group_id', data.group_id)
      .eq('user_id', data.user_id)
      .maybeSingle();

    if (existingMember) {
      throw new GroupError('You are already a member of this group', GroupErrorCodes.ALREADY_MEMBER);
    }

    logger.info('GROUP JOIN: Inserting group membership record');
    // Add user to group
    const { error } = await (supabase as any)
      .from('group_members')
      .insert({
        group_id: data.group_id,
        user_id: data.user_id,
        role: 'member',
        invited_by: data.invited_by
      });

    if (error) {
      logger.error('=== GROUP JOIN FAILED ===', { error, data });
      throw new GroupError('Failed to join group', GroupErrorCodes.PERMISSION_DENIED);
    }

    logger.info('=== GROUP JOIN SUCCESS ===', { 
      groupId: data.group_id, 
      userId: data.user_id,
      message: 'Database triggers should now create activity + notifications'
    });
  }

  /**
   * Leave a group
   */
  async leaveGroup(groupId: string, userId: string): Promise<void> {
    logger.info('User leaving group', { groupId, userId });

    const { error } = await (supabase as any)
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
   * Get physical units with associated groups
   */
  async getPhysicalUnitsWithGroups(neighborhoodId: string): Promise<PhysicalUnitWithGroup[]> {
    logger.info('Fetching physical units with groups', { neighborhoodId });

    try {
      // Get neighborhood config
      const config = await this.getNeighborhoodPhysicalConfig(neighborhoodId);
      
      // Get all physical groups for this neighborhood
      const { data: physicalGroups } = await (supabase as any)
        .from('groups')
        .select('*')
        .eq('neighborhood_id', neighborhoodId)
        .eq('group_type', 'physical')
        .eq('status', 'active');

      // Map units to groups
      const unitsWithGroups: PhysicalUnitWithGroup[] = config.physical_units.map(unit => {
        const group = physicalGroups?.find((g: any) => g.physical_unit_value === unit);
        return {
          unit_name: unit,
          unit_label: config.physical_unit_label,
          group: group || null
        };
      });

      logger.info('Successfully fetched physical units with groups', { 
        count: unitsWithGroups.length,
        neighborhoodId 
      });

      return unitsWithGroups;
    } catch (error) {
      logger.error('Error fetching physical units with groups', { error, neighborhoodId });
      return [];
    }
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
      logger.warn('Could not fetch neighborhood config, using defaults', { error, neighborhoodId });
      return {
        physical_unit_type: 'street' as PhysicalUnitType,
        physical_unit_label: 'Street',
        physical_units: []
      };
    }

    const config: NeighborhoodPhysicalConfig = {
      physical_unit_type: (data.physical_unit_type as PhysicalUnitType) || 'street',
      physical_unit_label: data.physical_unit_label || 'Street',
      physical_units: Array.isArray(data.physical_units) ? data.physical_units.map(unit => String(unit)) : []
    };

    logger.info('Successfully fetched neighborhood physical config', { 
      config,
      neighborhoodId 
    });

    return config;
  }

  /**
   * Update neighborhood physical units configuration
   */
  async updateNeighborhoodPhysicalUnits(data: UpdateNeighborhoodPhysicalUnitsData): Promise<void> {
    logger.info('Updating neighborhood physical units', { data });

    const { error } = await supabase
      .from('neighborhoods')
      .update({
        physical_unit_type: data.physical_unit_type,
        physical_unit_label: data.physical_unit_label,
        physical_units: data.physical_units
      })
      .eq('id', data.neighborhood_id);

    if (error) {
      logger.error('Error updating neighborhood physical units', { error, data });
      throw new GroupError('Failed to update physical units configuration', GroupErrorCodes.PERMISSION_DENIED);
    }

    logger.info('Successfully updated neighborhood physical units', { 
      neighborhoodId: data.neighborhood_id 
    });
  }

  /**
   * Validate physical unit against neighborhood configuration
   */
  private async validatePhysicalUnit(neighborhoodId: string, physicalUnit: string): Promise<void> {
    const config = await this.getNeighborhoodPhysicalConfig(neighborhoodId);
    
    if (!config.physical_units.includes(physicalUnit)) {
      throw new GroupError(
        `"${physicalUnit}" is not a valid ${config.physical_unit_label.toLowerCase()} in this neighborhood`,
        GroupErrorCodes.INVALID_PHYSICAL_UNIT
      );
    }
  }
}

// Export singleton instance
export const groupService = new GroupService();