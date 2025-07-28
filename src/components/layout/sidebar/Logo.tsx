import { Link } from "react-router-dom";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";

/**
 * Logo component 
 * 
 * Displays the app logo at the top of the sidebar
 * Updated to use the new neighborhoodOS logo
 * Now uses neighborhood-aware routing
 */
const Logo = () => {
  // Get current neighborhood for neighborhood-aware navigation
  const currentNeighborhood = useCurrentNeighborhood();
  
  // Generate neighborhood-aware home path
  const homePath = currentNeighborhood?.id 
    ? `/n/${currentNeighborhood.id}/home` 
    : '/dashboard'; // Fallback for users without neighborhoods
  
  return <div className="p-4 flex flex-col items-center">
      {/* Link to dashboard when logo is clicked */}
      <Link to={homePath} className="flex flex-col items-center">
        {/* The logo image - updated to use the new neighborhoodOS logo */}
        <img src="/lovable-uploads/694d84e4-fb27-4204-bf99-e54cd1ecbfe9.png" alt="neighborhoodOS Logo" className="h-24" />
        
        {/* Adding the text logo part */}
        
      </Link>
    </div>;
};
export default Logo;