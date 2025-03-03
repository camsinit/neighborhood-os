
import { Link } from "react-router-dom";

/**
 * Logo component 
 * 
 * Displays the app logo at the top of the sidebar
 */
const Logo = () => {
  return (
    <div className="p-4 flex justify-center">
      <Link to="/dashboard" className="flex items-center">
        <img 
          src="/lovable-uploads/93ce5a6d-0cd1-4119-926e-185060c6479d.png" 
          alt="Terrific Terrace Logo" 
          className="h-24"
        />
      </Link>
    </div>
  );
};

export default Logo;
