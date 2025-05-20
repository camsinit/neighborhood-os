
import { Link } from "react-router-dom";

/**
 * Logo component 
 * 
 * Displays the app logo at the top of the sidebar
 * Updated to use the new neighborhoodOS logo
 */
const Logo = () => {
  return <div className="p-4 flex flex-col items-center">
      {/* Link to home when logo is clicked */}
      <Link to="/home" className="flex flex-col items-center">
        {/* The logo image - updated to use the new neighborhoodOS logo */}
        <img src="/lovable-uploads/694d84e4-fb27-4204-bf99-e54cd1ecbfe9.png" alt="neighborhoodOS Logo" className="h-24" />
        
        {/* Adding the text logo part */}
        
      </Link>
    </div>;
};
export default Logo;
