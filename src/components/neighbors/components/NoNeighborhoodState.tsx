
import { Button } from "@/components/ui/button";
import { UserGrid } from "./UserGrid";
import { useNeighborUsers } from "../hooks/useNeighborUsers";
import { UserError } from "./UserError";
import { LoadingState } from "./LoadingState";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

/**
 * NoNeighborhoodState Component
 * 
 * This component informs users they need an invitation to join a neighborhood.
 * It redirects them to the home page or shows available profiles as a fallback.
 */
export const NoNeighborhoodState = () => {
  const navigate = useNavigate();
  
  // Fetch all available profiles as a fallback
  const { 
    data: users, 
    isLoading, 
    error,
    refetch 
  } = useNeighborUsers();
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (error) {
    return <UserError error={error} onRetry={refetch} />;
  }

  return (
    <div className="p-6">
      {/* Information card about invitation-only access */}
      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-lg text-center mb-2">Invitation Required</h3>
        <p className="text-gray-700 mb-4 text-center">
          To join a neighborhood, you need an invitation from an existing member. 
          Please contact someone you know who is already in a neighborhood and ask them for an invitation link.
        </p>
        <div className="flex justify-center">
          <Button 
            variant="default" 
            className="mt-2"
            onClick={() => navigate("/")}
          >
            Return to Home
          </Button>
        </div>
      </Card>
      
      {/* Show available profiles as a fallback */}
      {users && users.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-4">Available Profiles ({users.length})</h3>
          <div className="text-sm text-gray-500 mb-4">
            Here are some users already on the platform. You need an invitation to connect with them in a neighborhood.
          </div>
          <UserGrid users={users} onUserSelect={() => {}} />
        </div>
      )}
    </div>
  );
};
