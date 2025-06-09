
/**
 * Extended user interface that includes role information
 * This is used throughout the app when we need both user data and their roles
 */
export interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  roles: string[];
  profiles?: {
    display_name: string;
    avatar_url: string;
    address: string;
    phone_number: string;
    access_needs: string;
    email_visible: boolean;
    phone_visible: boolean;
    address_visible: boolean;
    needs_visible: boolean;
    bio: string;
    email?: string; // Add email field here too
  } | null;
}
