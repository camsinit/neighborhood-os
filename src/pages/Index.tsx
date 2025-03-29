
/**
 * Index page component
 * 
 * This component serves as the entry point to the application when a user visits the index route.
 * It redirects users based on authentication status and neighborhood context.
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { useNeighborhood } from "@/contexts/neighborhood";
import { Loader2 } from "lucide-react";

/**
 * Index component that handles routing logic
 * 
 * This component determines where to send users based on their authentication
 * and neighborhood status. It shows a loading indicator while making this determination.
 */
const Index = () => {
  // Navigation hook for redirecting users
  const navigate = useNavigate();
  
  // Get the current authenticated user
  const user = useUser();
  
  // Get neighborhood context
  const { currentNeighborhood, isLoading: isLoadingNeighborhood } = useNeighborhood();
  
  // Effect to handle routing logic based on authentication and neighborhood status
  useEffect(() => {
    // Safety check: If we're still loading neighborhood data, wait
    if (isLoadingNeighborhood) {
      console.log("[Index] Still loading neighborhood data, waiting before routing...");
      return;
    }
    
    // Logging to help with debugging
    console.log("[Index] Routing decision point reached:", {
      isAuthenticated: !!user,
      hasNeighborhood: !!currentNeighborhood,
      neighborhoodId: currentNeighborhood?.id,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
    
    // Add a small delay to prevent routing race conditions
    const timer = setTimeout(() => {
      // If user is not authenticated, redirect to landing page
      if (!user) {
        console.log("[Index] User not authenticated, redirecting to landing page");
        navigate("/", { replace: true });
        return;
      }
      
      // If authenticated but no neighborhood, redirect to join page
      if (user && !currentNeighborhood) {
        console.log("[Index] User authenticated but no neighborhood, redirecting to join page");
        navigate("/join", { replace: true });
        return;
      }
      
      // If authenticated and has neighborhood, redirect to home page
      if (user && currentNeighborhood) {
        console.log("[Index] User authenticated with neighborhood, redirecting to home page");
        navigate("/home", { replace: true });
        return;
      }
    }, 300); // Short delay to prevent flashing

    // Clean up timer on unmount
    return () => clearTimeout(timer);
  }, [user, currentNeighborhood, isLoadingNeighborhood, navigate]);

  // Show a visible loading indicator while determining where to route
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-gray-600">Setting up your dashboard...</p>
        <p className="text-gray-400 text-sm mt-2">
          {isLoadingNeighborhood ? "Loading your neighborhood..." : "Preparing your experience..."}
        </p>
      </div>
    </div>
  );
};

export default Index;
