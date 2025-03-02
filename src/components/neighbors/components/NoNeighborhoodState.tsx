
import { Button } from "@/components/ui/button";
import { UserGrid } from "./UserGrid";
import { useNeighborUsers } from "../hooks/useNeighborUsers";
import { UserError } from "./UserError";
import { LoadingState } from "./LoadingState";

/**
 * NoNeighborhoodState Component
 * 
 * This improved version shows available profiles even when no neighborhood is selected,
 * providing a better user experience.
 */
export const NoNeighborhoodState = () => {
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
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-lg text-yellow-800">No Neighborhood Selected</h3>
        <p className="text-yellow-700 mb-2">
          You are not currently part of any neighborhood. However, you can still see profiles of other users in the system.
        </p>
        <Button variant="outline" className="mt-2">
          Create a Neighborhood
        </Button>
      </div>
      
      {users && users.length > 0 ? (
        <div>
          <h3 className="font-semibold text-lg mb-4">Available Profiles ({users.length})</h3>
          <UserGrid users={users} onUserSelect={() => {}} />
        </div>
      ) : (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No profiles available.</p>
        </div>
      )}
    </div>
  );
};
