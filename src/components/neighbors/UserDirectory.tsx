
import { useState, useEffect } from "react";
import { UserWithRole } from "@/types/roles";
import { LoadingSpinner } from "@/components/ui/loading";
import { NeighborCard } from "./NeighborCard";
import { NeighborProfileDialog } from "./NeighborProfileDialog";
import { useNeighborUsers } from "./hooks/useNeighborUsers";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { useNeighborhood } from "@/contexts/NeighborhoodContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, UserPlus, RefreshCw, Users } from "lucide-react";
import EmptyState from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface UserDirectoryProps {
  searchQuery?: string;
}

export const UserDirectory = ({ searchQuery = "" }: UserDirectoryProps) => {
  // State to track which user's profile is being viewed
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  
  // Get neighborhood context to show appropriate messages
  const { currentNeighborhood, isLoading: isLoadingNeighborhood, error: neighborhoodError } = useNeighborhood();
  
  // Use our custom hook to fetch users
  const { 
    data: users, 
    isLoading, 
    error,
    refetch 
  } = useNeighborUsers();
  
  // Add detailed debugging for tracking the neighborhood state
  useEffect(() => {
    console.log("[UserDirectory] Neighborhood state updated:", { 
      neighborhoodId: currentNeighborhood?.id,
      neighborhoodName: currentNeighborhood?.name,
      isLoading: isLoadingNeighborhood,
      error: neighborhoodError ? neighborhoodError.message : null,
      timestamp: new Date().toISOString()
    });
  }, [currentNeighborhood, isLoadingNeighborhood, neighborhoodError]);
  
  // Add debugging for tracking the query state
  useEffect(() => {
    console.log("[UserDirectory] Query state updated:", { 
      isLoading, 
      usersCount: users?.length || 0,
      error: error ? error.message : null,
      timestamp: new Date().toISOString()
    });
  }, [users, isLoading, error]);
  
  // Set up auto-refresh for neighbors data
  // This will listen for profile update events and refresh the data
  useAutoRefresh(['neighbor-users'], ['profile-updated']);

  // Handle manual refresh of the neighbors list
  const handleRefresh = () => {
    console.log("[UserDirectory] Manual refresh triggered");
    toast({
      title: "Refreshing...",
      description: "Updating neighbor data"
    });
    refetch();
  };

  // Filter users based on search query
  const filteredUsers = users?.filter(user => 
    searchQuery === "" || 
    user.profiles?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.profiles?.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add debugging for search results
  useEffect(() => {
    console.log("[UserDirectory] Filtered users:", {
      searchQuery,
      totalUsers: users?.length || 0,
      filteredCount: filteredUsers?.length || 0,
      timestamp: new Date().toISOString()
    });
  }, [searchQuery, users, filteredUsers]);

  // Show loading state while users or neighborhood are loading
  if (isLoading || isLoadingNeighborhood) {
    return (
      <div className="p-6 text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-500">Loading neighborhood data...</p>
      </div>
    );
  }

  // If there's a neighborhood error
  if (neighborhoodError) {
    console.error("[UserDirectory] Neighborhood error:", neighborhoodError);
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-5 w-5 mr-2" />
          <AlertDescription>
            Error loading neighborhood data: {neighborhoodError.message}
            {neighborhoodError.message.includes("recursion") && (
              <span className="block mt-2 text-sm">
                There is a database policy issue. Please contact support.
              </span>
            )}
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={handleRefresh} variant="outline" className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // If there's no neighborhood, show a message
  if (!currentNeighborhood) {
    return (
      <div className="p-6">
        <Alert className="mb-4">
          <Users className="h-5 w-5 mr-2" />
          <AlertDescription>
            You're not part of any neighborhood yet. Join or create a neighborhood to see residents.
          </AlertDescription>
        </Alert>
        <EmptyState
          icon={UserPlus}
          title="Join a Neighborhood"
          description="You need to join or create a neighborhood to connect with neighbors."
          actionLabel="Create Neighborhood"
          onAction={() => console.log("Create neighborhood clicked")}
        />
      </div>
    );
  }

  // If there's an error loading users
  if (error) {
    console.error("[UserDirectory] Error loading users:", error);
    return (
      <div className="p-6 text-center">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-5 w-5 mr-2" />
          <AlertDescription>
            Error loading users: {error.message}
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={handleRefresh} variant="outline" className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // If no users found
  if (!users?.length) {
    console.log("[UserDirectory] No users found to display");
    return (
      <div className="p-6">
        <div className="text-center bg-white rounded-lg p-8 shadow">
          <h3 className="text-lg font-medium mb-2">No neighbors found</h3>
          <p className="text-gray-500 mb-4">Your neighborhood "{currentNeighborhood.name}" doesn't have any members yet.</p>
          <Button onClick={handleRefresh} variant="outline" className="flex items-center mx-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Show neighborhood info */}
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Current Neighborhood:</h3>
          <p className="text-base font-semibold">{currentNeighborhood.name}</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" className="flex items-center">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {/* Grid of neighbor cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredUsers?.map(user => (
          <NeighborCard 
            key={user.id}
            user={user}
            onClick={() => setSelectedUser(user)}
          />
        ))}
      </div>

      {/* Profile Dialog */}
      <NeighborProfileDialog 
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}
