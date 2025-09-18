
import { useState, useEffect } from "react";
import { UserWithRole } from "@/types/roles";
import { useNeighborUsers } from "./hooks/useNeighborUsers";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { useNeighborhood } from "@/contexts/NeighborhoodContext";
import { toast } from "@/components/ui/use-toast";
import { NeighborProfileDialog } from "./NeighborProfileDialog";

// Import our components
import { LoadingState } from "./components/LoadingState";
import { EmptyState } from "./components/EmptyState";
import { NeighborhoodError } from "./components/NeighborhoodError";
import { UserError } from "./components/UserError";
import { NoNeighborhoodState } from "./components/NoNeighborhoodState";
import { UserGrid } from "./components/UserGrid";

interface UserDirectoryProps {
  searchQuery?: string;
  onNeighborClick?: (itemId: string, item?: any) => void;
}

/**
 * UserDirectory Component
 * 
 * This is the main component that displays a directory of users in the neighborhood.
 * It handles loading, error states, and rendering the appropriate UI based on the data.
 * Now receives search query as a prop from the parent component.
 */
export const UserDirectory: React.FC<UserDirectoryProps> = ({ searchQuery = "", onNeighborClick }) => {
  // State to track which user's profile is being viewed
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);

  // Get neighborhood context to show appropriate messages
  const {
    currentNeighborhood,
    isLoading: isLoadingNeighborhood,
    error: neighborhoodError
  } = useNeighborhood();

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
    return <LoadingState />;
  }

  // If there's a neighborhood error
  if (neighborhoodError) {
    console.error("[UserDirectory] Neighborhood error:", neighborhoodError);
    return <NeighborhoodError error={neighborhoodError} onRetry={handleRefresh} />;
  }

  // If there's no neighborhood, show a message
  if (!currentNeighborhood) {
    return <NoNeighborhoodState />;
  }

  // If there's an error loading users
  if (error) {
    console.error("[UserDirectory] Error loading users:", error);
    return <UserError error={error} onRetry={handleRefresh} />;
  }

  // If no users found
  if (!users?.length) {
    console.log("[UserDirectory] No users found to display");
    return <EmptyState neighborhoodName={currentNeighborhood.name} onRefresh={handleRefresh} />;
  }
  
  return (
    <div className="p-6">
      {/* Grid of neighbor cards */}
      <UserGrid 
        users={filteredUsers || []} 
        onUserSelect={onNeighborClick ? (user) => onNeighborClick(user.id, user) : setSelectedUser} 
      />

      {/* Profile Dialog - Only show when not using the new sheet system */}
      {!onNeighborClick && (
        <NeighborProfileDialog user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
};
