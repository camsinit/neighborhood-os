
import { useState } from "react";
import { UserWithRole } from "@/types/roles";
import { LoadingSpinner } from "@/components/ui/loading";
import { NeighborCard } from "./NeighborCard";
import { NeighborProfileDialog } from "./NeighborProfileDialog";
import { useNeighborUsers } from "./hooks/useNeighborUsers";
import { useNeighborhood } from "@/contexts/NeighborhoodContext";

interface UserDirectoryProps {
  searchQuery?: string;
}

export const UserDirectory = ({ searchQuery = "" }: UserDirectoryProps) => {
  // Get the current neighborhood from context
  const { currentNeighborhood, isLoading: isLoadingNeighborhood } = useNeighborhood();
  
  // State to track which user's profile is being viewed
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  
  // Use our custom hook to fetch users
  const { data: users, isLoading: isLoadingUsers } = useNeighborUsers();

  // Filter users based on search query
  const filteredUsers = users?.filter(user => 
    searchQuery === "" || 
    user.profiles?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.profiles?.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoadingUsers || isLoadingNeighborhood) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Neighborhood Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          {currentNeighborhood?.name || 'Your Neighborhood'}
        </h1>
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
};
