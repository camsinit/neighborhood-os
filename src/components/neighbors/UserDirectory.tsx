
import { useState, useEffect } from "react";
import { UserWithRole } from "@/types/roles";
import { LoadingSpinner } from "@/components/ui/loading";
import { NeighborCard } from "./NeighborCard";
import { NeighborProfileDialog } from "./NeighborProfileDialog";
import { useNeighborUsers } from "./hooks/useNeighborUsers";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

interface UserDirectoryProps {
  searchQuery?: string;
}

export const UserDirectory = ({ searchQuery = "" }: UserDirectoryProps) => {
  // State to track which user's profile is being viewed
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  
  // Use our custom hook to fetch users
  const { data: users, isLoading, error } = useNeighborUsers();
  
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Add debugging for the error state
  if (error) {
    console.error("[UserDirectory] Error loading users:", error);
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Error loading users: {error.message}</p>
      </div>
    );
  }

  // Add debugging for empty state
  if (!users?.length) {
    console.log("[UserDirectory] No users found to display");
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No users found in this neighborhood.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
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
};
