
import { useState, useEffect, useRef } from "react";
import { UserWithRole } from "@/types/roles";
import { useNeighborUsers } from "./hooks/useNeighborUsers";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { useNeighborhood } from "@/contexts/NeighborhoodContext";
import { toast } from "@/components/ui/use-toast";
import { NeighborProfileDialog } from "./NeighborProfileDialog";
import { useHighlightedItem } from "@/hooks/useHighlightedItem";
import { createLogger } from "@/utils/logger";

// Import our components
import { LoadingState } from "./components/LoadingState";
import { EmptyState } from "./components/EmptyState";
import { NeighborhoodError } from "./components/NeighborhoodError";
import { UserError } from "./components/UserError";
import { NoNeighborhoodState } from "./components/NoNeighborhoodState";
import { UserGrid } from "./components/UserGrid";
import { NeighborhoodHeader } from "./components/NeighborhoodHeader";

// Create a logger for this component
const logger = createLogger('UserDirectory');

/**
 * UserDirectory Component
 * 
 * This is the main component that displays a directory of users in the neighborhood.
 * It handles loading, error states, and rendering the appropriate UI based on the data.
 * Now includes support for highlighting specific neighbors from notifications.
 * 
 * @param searchQuery - Optional search query to filter users
 */
interface UserDirectoryProps {
  searchQuery?: string;
}

export const UserDirectory = ({
  searchQuery = ""
}: UserDirectoryProps) => {
  // State to track which user's profile is being viewed
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  
  // Container ref for scrolling to highlighted elements
  const containerRef = useRef<HTMLDivElement>(null);

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
  
  // Get the currently highlighted neighbor ID
  const { id: highlightedNeighborId } = useHighlightedItem('neighbor');
  
  // Effect to handle scrolling to highlighted neighbor
  useEffect(() => {
    if (highlightedNeighborId && containerRef.current && users) {
      logger.debug('Scrolling to highlighted neighbor:', highlightedNeighborId);
      
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        // Find the highlighted neighbor element
        const element = document.querySelector(`[data-neighbor-id="${highlightedNeighborId}"]`) as HTMLElement;
        
        if (element) {
          // Smooth scroll to the element
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          
          logger.debug('Scrolled to highlighted neighbor element');
        }
      }, 100);
    }
  }, [highlightedNeighborId, users]);

  // Add detailed debugging for tracking the neighborhood state
  useEffect(() => {
    logger.debug("Neighborhood state updated:", {
      neighborhoodId: currentNeighborhood?.id,
      neighborhoodName: currentNeighborhood?.name,
      isLoading: isLoadingNeighborhood,
      error: neighborhoodError ? neighborhoodError.message : null,
      timestamp: new Date().toISOString()
    });
  }, [currentNeighborhood, isLoadingNeighborhood, neighborhoodError]);

  // Set up auto-refresh for neighbors data
  useAutoRefresh(['neighbor-users'], ['profile-updated']);

  // Handle manual refresh of the neighbors list
  const handleRefresh = () => {
    logger.debug("Manual refresh triggered");
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

  // Show loading state while users or neighborhood are loading
  if (isLoading || isLoadingNeighborhood) {
    return <LoadingState />;
  }

  // If there's a neighborhood error
  if (neighborhoodError) {
    logger.error("Neighborhood error:", neighborhoodError);
    return <NeighborhoodError error={neighborhoodError} onRetry={handleRefresh} />;
  }

  // If there's no neighborhood, show a message
  if (!currentNeighborhood) {
    return <NoNeighborhoodState />;
  }

  // If there's an error loading users
  if (error) {
    logger.error("Error loading users:", error);
    return <UserError error={error} onRetry={handleRefresh} />;
  }

  // If no users found
  if (!users?.length) {
    logger.debug("No users found to display");
    return <EmptyState neighborhoodName={currentNeighborhood.name} onRefresh={handleRefresh} />;
  }
  
  return (
    // Added ref to the container for scrolling
    <div className="p-6" ref={containerRef}>
      {/* Grid of neighbor cards */}
      <UserGrid users={filteredUsers || []} onUserSelect={setSelectedUser} />

      {/* Profile Dialog */}
      <NeighborProfileDialog user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
};
