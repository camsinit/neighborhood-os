
import { UserWithRole } from "@/types/roles";
import { NeighborCard } from "../NeighborCard";
import { useHighlightedItem } from "@/hooks/useHighlightedItem";

/**
 * UserGrid Component
 * 
 * Displays a responsive grid of user cards with highlight support.
 * 
 * @param users - Array of users to display in the grid
 * @param onUserSelect - Callback function when a user card is clicked
 */
interface UserGridProps {
  users: UserWithRole[];
  onUserSelect: (user: UserWithRole) => void;
}

export const UserGrid = ({ users, onUserSelect }: UserGridProps) => {
  // Use the highlight hook to track which neighbor is currently highlighted
  const { id: highlightedNeighborId } = useHighlightedItem('neighbor');
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {users.map(user => (
        <NeighborCard 
          key={user.id}
          user={user}
          // Pass the highlighted state based on the current highlighted ID
          isHighlighted={highlightedNeighborId === user.id}
          onClick={() => onUserSelect(user)}
        />
      ))}
    </div>
  );
};
