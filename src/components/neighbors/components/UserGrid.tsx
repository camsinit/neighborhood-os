
import { UserWithRole } from "@/types/roles";
import { NeighborCard } from "../NeighborCard";

/**
 * UserGrid Component
 * 
 * This component displays a grid of user cards.
 * 
 * @param users - Array of users to display in the grid
 * @param onUserSelect - Callback function when a user card is clicked
 */
interface UserGridProps {
  users: UserWithRole[];
  onUserSelect: (user: UserWithRole) => void;
}

export const UserGrid = ({ users, onUserSelect }: UserGridProps) => {
  // The component renders a grid of NeighborCard components
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {users.map(user => (
        <NeighborCard 
          key={user.id}
          user={user}
          onClick={() => onUserSelect(user)}
        />
      ))}
    </div>
  );
};
