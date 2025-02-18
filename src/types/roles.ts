
export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'user';

export interface UserWithRole {
  id: string;
  email?: string;
  created_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    address: string | null;
    phone_number: string | null;
    access_needs: string | null;
    email_visible: boolean;
    phone_visible: boolean;
    address_visible: boolean;
    needs_visible: boolean;
    bio: string | null;
  };
  roles: UserRole[];
}
