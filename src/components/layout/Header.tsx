
import { useUser } from "@supabase/auth-helpers-react";
import { useNeighborhood } from "@/contexts/neighborhood";

/**
 * Header component props
 */
interface HeaderProps {
  // Removed onOpenSettings since we're navigating instead
}

/**
 * Header component
 * 
 * Displays the application header with neighborhood name and user information
 */
const Header = ({}: HeaderProps) => {
  const user = useUser();
  const { currentNeighborhood } = useNeighborhood();

  return (
    <header className="bg-white border-b p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {currentNeighborhood?.name || "Your Neighborhood"}
        </h1>
        <div className="flex items-center">
          <span className="mr-4 font-medium">
            {user?.user_metadata?.name || "Welcome"}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
