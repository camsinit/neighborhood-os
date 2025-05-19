
import { cn } from "@/lib/utils"; // Import cn utility for conditional class names

/**
 * AuthHeader Component
 * 
 * Displays the title and subtitle for the authentication page.
 * Updated with styling to match the landing page hero section.
 */
const AuthHeader = () => {
  return <div className="text-center mb-6 relative z-10"> {/* Added z-index and margin */}
      {/* Title with gradient text effect to match hero section styling */}
      <h2 className={cn("relative z-10 inline-block", "bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text", "text-3xl font-semibold leading-tight text-transparent drop-shadow-2xl", "sm:text-4xl sm:leading-tight")}>Login to the Neighborhood</h2>
      
      {/* Subtitle with muted foreground to match hero description */}
      <p className="mt-2 text-md font-medium text-muted-foreground">Neighbors are waiting ◡̈ </p>
    </div>;
};
export default AuthHeader;
