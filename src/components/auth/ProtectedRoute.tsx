
/**
 * ProtectedRoute component
 * 
 * Ensures routes are only accessible to authenticated users.
 * Displays a loading spinner while authentication is being checked.
 * Checks if user needs to complete onboarding and redirects accordingly.
 */
import { useUser, useSessionContext } from "@supabase/auth-helpers-react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useNeighborhood } from "@/contexts/neighborhood";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Props for the ProtectedRoute component
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component
 * 
 * This component checks if the user is authenticated and has necessary data
 * before allowing access to protected routes. It shows a loading state while checking.
 * 
 * @param children - The components to render if the user is authenticated
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Get authentication state from Supabase Auth Helpers
  const { isLoading: isLoadingAuth, session } = useSessionContext();
  const user = useUser();
  const location = useLocation();
  
  // Get neighborhood status - using our updated neighborhood context
  const { currentNeighborhood, isLoading: isLoadingNeighborhood, error } = useNeighborhood();
  
  // Add check for onboarding status
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  
  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // Skip if we're already on the onboarding page
      if (location.pathname === '/onboarding') {
        setIsCheckingOnboarding(false);
        return;
      }
      
      // Skip if no user
      if (!user) {
        setIsCheckingOnboarding(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("completed_onboarding")
          .eq("id", user.id)
          .single();
          
        if (error) throw error;
        
        // If onboarding isn't completed, set flag to redirect
        setNeedsOnboarding(!data?.completed_onboarding);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // Default to not needing onboarding on error to avoid redirect loops
        setNeedsOnboarding(false);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };
    
    if (user) {
      checkOnboardingStatus();
    } else {
      setIsCheckingOnboarding(false);
    }
  }, [user, location.pathname]);

  // Debug info - this helps us track auth and routing issues
  console.log("[ProtectedRoute] Checking route access:", {
    path: location.pathname,
    isLoadingAuth,
    isLoadingNeighborhood,
    isCheckingOnboarding,
    hasUser: !!user,
    hasNeighborhood: !!currentNeighborhood,
    needsOnboarding,
    neighborhoodError: error ? true : false
  });

  // Show loading spinner while checking authentication and neighborhood
  if (isLoadingAuth || (isLoadingNeighborhood && user) || (isCheckingOnboarding && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isLoadingAuth ? "Verifying your account..." : 
             isCheckingOnboarding ? "Checking your profile status..." :
             "Loading your neighborhood..."}
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!user || !session) {
    console.log("[ProtectedRoute] User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If user needs to complete onboarding, redirect to onboarding page
  // Don't redirect if we're already on the onboarding page to avoid loops
  if (needsOnboarding && location.pathname !== '/onboarding') {
    console.log("[ProtectedRoute] User needs to complete onboarding, redirecting");
    return <Navigate to="/onboarding" replace />;
  }
  
  // Handle special cases for join pages to avoid infinite loops
  const isJoinPage = location.pathname === '/join' || location.pathname.startsWith('/join/');
  const isHomePage = location.pathname === '/home'; // Simplified home page check
  
  // If user has no neighborhood and trying to access a page that requires one,
  // redirect to join page - except for the join page itself and home page to avoid loops
  if (!currentNeighborhood && !isJoinPage && !isHomePage) {
    console.log("[ProtectedRoute] User has no neighborhood, redirecting to join page");
    return <Navigate to="/join" replace />;
  }

  // User is authenticated and has necessary data, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
