
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useInvitation } from "@/hooks/join/useInvitation";
import LoadingState from "@/components/join/LoadingState";
import ErrorState from "@/components/join/ErrorState";
import InvitationActions from "@/components/join/InvitationActions";

/**
 * JoinPage Component
 * 
 * This component handles the process of joining a neighborhood through an invitation link.
 * It validates the invite code, shows relevant UI states, and processes the join request.
 */
const JoinPage = () => {
  // Get the invite code from URL parameters
  const { inviteCode } = useParams();
  
  // Use our custom hook to handle all invitation logic
  const {
    invitation,
    loading,
    joining,
    error,
    user,
    handleQuickJoin,
    handleFullOnboarding
  } = useInvitation(inviteCode);

  // Show loading state while fetching invitation data
  if (loading) {
    return <LoadingState />;
  }

  // Show error state if invitation is invalid or has expired
  if (error || !invitation) {
    return <ErrorState error={error} />;
  }

  // Show invitation card with neighborhood information and action buttons
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="p-6 max-w-md w-full">
        {/* Invitation header with neighborhood name */}
        <h1 className="text-2xl font-bold text-center mb-4">
          Join {invitation.neighborhoods.name}
        </h1>
        
        {/* Brief explanation of invitation */}
        <p className="text-center text-gray-600 mb-6">
          You've been invited to join this neighborhood community.
        </p>
        
        {/* Action buttons based on authentication status */}
        <InvitationActions 
          user={user}
          invitation={invitation}
          joining={joining}
          onQuickJoin={handleQuickJoin}
          onFullOnboarding={handleFullOnboarding}
        />
      </Card>
    </div>
  );
};

export default JoinPage;
