/**
 * Groups Feature - Type Definitions
 * 
 * Core TypeScript types for the Groups feature including:
 * - Group and membership types
 * - Physical unit configuration
 * - Form data types
 * - API response types
 */

// Physical unit types for neighborhood configuration
export type PhysicalUnitType = 'street' | 'floor' | 'block' | 'building' | 'court' | 'wing' | 'section' | 'custom';

export interface NeighborhoodPhysicalConfig {
  physical_unit_type: PhysicalUnitType;
  physical_unit_label: string;
  physical_units: string[];
}

// Group types
export type GroupType = 'physical' | 'social';
export type GroupStatus = 'active' | 'archived' | 'suspended';
export type GroupMemberRole = 'owner' | 'moderator' | 'member';
export type GroupInvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

// Core group interface
export interface Group {
  id: string;
  neighborhood_id: string;
  name: string;
  description?: string;
  group_type: GroupType;
  physical_unit_value?: string; // Only for physical groups
  banner_image_url?: string; // Cover photo for groups
  created_by: string;
  created_at: string;
  updated_at: string;
  status: GroupStatus;
  max_members: number;
  is_private: boolean;
  
  // Computed fields (from joins)
  member_count?: number;
  created_by_profile?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  current_user_membership?: {
    role: GroupMemberRole;
    joined_at: string;
  };
}

// Group membership interface
export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupMemberRole;
  joined_at: string;
  invited_by?: string;
  
  // Profile information (from joins)
  profile?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

// Group invitation interface
export interface GroupInvitation {
  id: string;
  group_id: string;
  inviter_id: string;
  invitee_id: string;
  status: GroupInvitationStatus;
  message?: string;
  expires_at: string;
  created_at: string;
  responded_at?: string;
  
  // Related data (from joins)
  group?: Pick<Group, 'id' | 'name' | 'group_type'>;
  inviter_profile?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  invitee_profile?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

// User's group membership with group details
export interface UserGroup {
  role: GroupMemberRole;
  joined_at: string;
  group: Group;
}

// Physical unit with associated group (if any)
export interface PhysicalUnitWithGroup {
  unit_name: string;
  unit_label: string;
  group?: Group | null;
}

// Form data types
export interface CreateGroupFormData {
  name: string;
  description?: string;
  group_type: GroupType;
  physical_unit_value?: string;
  is_private: boolean;
  max_members?: number;
  banner_image_url?: string; // Cover photo URL
  invited_neighbors?: string[]; // User IDs of neighbors to invite
}

export interface CreateGroupData extends CreateGroupFormData {
  neighborhood_id: string;
  created_by: string;
}

export interface UpdateGroupFormData {
  name?: string;
  description?: string;
  is_private?: boolean;
  max_members?: number;
  status?: GroupStatus;
  physical_unit_value?: string;
  banner_image_url?: string;
}

export interface JoinGroupData {
  group_id: string;
  user_id: string;
  invited_by?: string;
}

export interface InviteToGroupData {
  group_id: string;
  inviter_id: string;
  invitee_id: string;
  message?: string;
}

export interface RespondToInvitationData {
  invitation_id: string;
  response: 'accepted' | 'declined';
}

// API response types
export interface GetGroupsOptions {
  groupType?: GroupType;
  search?: string;
  includeMemberCount?: boolean;
  includeCurrentUserMembership?: boolean;
}

export interface GetGroupsResponse {
  groups: Group[];
  total: number;
}

export interface GetGroupMembersResponse {
  members: GroupMember[];
  total: number;
}

export interface GetUserGroupsResponse {
  groups: UserGroup[];
  total: number;
}

export interface GetPhysicalUnitsResponse {
  units: PhysicalUnitWithGroup[];
  neighborhood_config: NeighborhoodPhysicalConfig;
}

// Neighborhood settings update types
export interface UpdateNeighborhoodPhysicalUnitsData {
  neighborhood_id: string;
  physical_unit_type: PhysicalUnitType;
  physical_unit_label: string;
  physical_units: string[];
}

// Group activity metadata types
export interface GroupActivityMetadata {
  group_name: string;
  group_type: GroupType;
  physical_unit_value?: string;
  member_role?: GroupMemberRole;
  member_count?: number;
}

// Enhanced content types with group support
export interface GroupTargetedEvent {
  id: string;
  title: string;
  description?: string;
  time: string;
  location: string;
  host_id: string;
  neighborhood_id: string;
  group_id?: string; // NEW: Optional group targeting
  created_at: string;
  
  // Related data
  profiles?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  target_group?: Group;
  rsvp_count?: number;
}

export interface GroupTargetedSafetyUpdate {
  id: string;
  title: string;
  description?: string;
  type: string;
  author_id: string;
  neighborhood_id: string;
  group_id?: string; // NEW: Optional group targeting
  image_url?: string;
  created_at: string;
  
  // Related data
  profiles?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  target_group?: Group;
  comment_count?: number;
}

// Error types
export class GroupError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'GroupError';
  }
}

export const GroupErrorCodes = {
  GROUP_NOT_FOUND: 'GROUP_NOT_FOUND',
  ALREADY_MEMBER: 'ALREADY_MEMBER',
  GROUP_FULL: 'GROUP_FULL',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  INVALID_GROUP_NAME: 'INVALID_GROUP_NAME',
  DUPLICATE_GROUP_NAME: 'DUPLICATE_GROUP_NAME',
  DUPLICATE_PHYSICAL_UNIT: 'DUPLICATE_PHYSICAL_UNIT',
  CANNOT_LEAVE_AS_OWNER: 'CANNOT_LEAVE_AS_OWNER',
  GROUP_ARCHIVED: 'GROUP_ARCHIVED',
  INVITATION_NOT_FOUND: 'INVITATION_NOT_FOUND',
  INVITATION_EXPIRED: 'INVITATION_EXPIRED',
  INVALID_PHYSICAL_UNIT: 'INVALID_PHYSICAL_UNIT'
} as const;

export type GroupErrorCode = keyof typeof GroupErrorCodes;

// Utility types for filtering and sorting
export type GroupSortBy = 'name' | 'created_at' | 'member_count' | 'group_type';
export type GroupSortOrder = 'asc' | 'desc';

export interface GroupFilters {
  groupType?: GroupType;
  search?: string;
  physicalUnit?: string;
  isPrivate?: boolean;
  memberCount?: {
    min?: number;
    max?: number;
  };
}

export interface GroupSortOptions {
  sortBy: GroupSortBy;
  sortOrder: GroupSortOrder;
}

// Physical unit management types
export interface PhysicalUnitValidation {
  isValid: boolean;
  errors: string[];
  suggestions?: string[];
}

export interface BulkPhysicalUnitUpdate {
  add: string[];
  remove: string[];
  rename: Record<string, string>; // old_name -> new_name
}

// Group statistics types (for admin/analytics)
export interface GroupStatistics {
  total_groups: number;
  physical_groups: number;
  social_groups: number;
  private_groups: number;
  average_members_per_group: number;
  most_popular_group: Pick<Group, 'id' | 'name' | 'member_count'>;
  recent_activity: {
    groups_created_last_week: number;
    new_members_last_week: number;
  };
}

// Group content statistics
export interface GroupContentStats {
  group_id: string;
  events_count: number;
  safety_updates_count: number;
  recent_activity_count: number;
  last_activity_date?: string;
}