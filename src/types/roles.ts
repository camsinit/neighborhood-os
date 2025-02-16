
export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'user';

export interface UserWithRole {
  id: string;
  email?: string;
  created_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    address: string | null;
  };
  roles: UserRole[];
}
