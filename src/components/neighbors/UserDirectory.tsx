
import { useState } from "react";
import { UserWithRole } from "@/types/roles";
import { LoadingSpinner } from "@/components/ui/loading";
import { NeighborCard } from "./NeighborCard";
import { NeighborProfileDialog } from "./NeighborProfileDialog";
import { useNeighborUsers } from "./hooks/useNeighborUsers";

interface UserDirectoryProps {
  searchQuery?: string;
}

export const UserDirectory = ({ searchQuery = "" }: UserDirectoryProps) => {
  // State to track which user's profile is being viewed
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  
  // Use our custom hook to fetch users
  const { data: users, isLoading } = useNeighborUsers();

  // Filter users based on search query
  const filteredUsers = users?.filter(user => 
    searchQuery === "" || 
    user.profiles?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.profiles?.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSpinner />;
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
