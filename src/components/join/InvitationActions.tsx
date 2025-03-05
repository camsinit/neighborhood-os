
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { Invitation } from "@/hooks/join/useInvitation";

/**
 * InvitationActions Component
 * 
 * Displays different action buttons based on the user's authentication status.
 * For unauthenticated users, it shows login options.
 * For authenticated users, it shows join options.
 * 
 * @param user - The current user object
 * @param invitation - The invitation data
 * @param joining - Whether the join process is in progress
 * @param onQuickJoin - Function to handle immediate joining
 * @param onFullOnboarding - Function to handle full onboarding flow
 */
interface InvitationActionsProps {
  user: User | null;
  invitation: Invitation;
  joining: boolean;
  onQuickJoin: () => void;
  onFullOnboarding: () => void;
}

const InvitationActions = ({ 
  user, 
  invitation, 
  joining, 
  onQuickJoin, 
  onFullOnboarding 
}: InvitationActionsProps) => {
  // If user is not logged in, show login options
  if (!user) {
    return (
      <div className="space-y-4">
        {/* Sign in button */}
        <Button className="w-full" asChild>
          <Link to="/login">Sign in to join</Link>
        </Button>
        
        {/* Create account link */}
        <p className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Create one
          </a>
        </p>
      </div>
    );
  }
  
  // If user is logged in, show join options
  return (
    <div className="space-y-4">
      {/* Quick join button */}
      <Button 
        className="w-full"
        onClick={onQuickJoin}
        disabled={joining}
      >
        {joining ? "Joining..." : "Join Now"}
      </Button>
      
      {/* Divider with "or" text */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">or</span>
        </div>
      </div>
      
      {/* Join with profile setup button */}
      <Button 
        variant="outline"
        className="w-full"
        onClick={onFullOnboarding}
      >
        Join & Complete Profile
      </Button>
      
      {/* Explanatory text for profile setup */}
      <p className="text-center text-xs text-gray-500 mt-2">
        The complete profile option will guide you through setting up your neighborhood profile
      </p>
    </div>
  );
};

export default InvitationActions;
