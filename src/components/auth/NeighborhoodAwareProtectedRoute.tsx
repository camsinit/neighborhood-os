/**
 * NeighborhoodAwareProtectedRoute component
 *
 * Enhanced version of ProtectedRoute that handles neighborhood-specific routing.
 * Supports both legacy routes and new neighborhood-specific URLs.
 * Provides special handling for super admins to access any neighborhood.
 */
import { useEffect } from "react";
import { useUser, useSessionContext } from "@supabase/auth-helpers-react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useNeighborhood } from "@/contexts/neighborhood";
import { useSuperAdminAccess } from "@/hooks/useSuperAdminAccess";
import { useOnboardingStatus } from "./hooks/useOnboardingStatus";
import { useGuestOnboardingMode } from "./hooks/useGuestOnboardingMode";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { isJoinPage, isHomePage, isOnboardingPage } from "./utils/routeChecks";
import { createLogger } from "@/utils/logger";

// Dedicated logger for this route guard
const logger = createLogger('NeighborhoodAwareProtectedRoute');

interface NeighborhoodAwareProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Enhanced ProtectedRoute that handles neighborhood-specific routing
 */
const NeighborhoodAwareProtectedRoute = ({ children }: NeighborhoodAwareProtectedRouteProps) => {
  const { isLoading: isLoadingAuth, session } = useSessionContext();
  const user = useUser();
  const location = useLocation();
  const params = useParams();
  
  // Get neighborhood status and super admin access
  const { currentNeighborhood, isLoading: isLoadingNeighborhood, error } = useNeighborhood();
  const { isSuperAdmin, isLoading: isLoadingSuperAdmin } = useSuperAdminAccess();
  
  // Get onboarding status
  const { isCheckingOnboarding, needsOnboarding } = useOnboardingStatus();
  const { isGuestOnboardingMode } = useGuestOnboardingMode();

  // Check if we're on a neighborhood-specific route
  const neighborhoodIdFromUrl = params.neighborhoodId;
  const isNeighborhoodRoute = location.pathname.startsWith('/n/');

  // Add debug logging for specific user having issues
  useEffect(() => {
    if (user?.id === '74bf3085-8275-4eb2-a721-8c8e91b3d3d8') {
      console.log('[DEBUG - User 74bf...] NeighborhoodAwareProtectedRoute - Analysis:', {
        fullPath: location.pathname,
        search: location.search,
        allParams: params,
        neighborhoodIdFromUrl,
        isNeighborhoodRoute,
        currentNeighborhoodId: currentNeighborhood?.id,
        isSuperAdmin,
        isLoadingAuth,
        isLoadingNeighborhood,
        isLoadingSuperAdmin,
        willRedirectToLanding: !user || !session,
        hasNeighborhood: !!currentNeighborhood,
        timestamp: new Date().toISOString()
      });
    }
  }, [location.pathname, location.search, neighborhoodIdFromUrl, currentNeighborhood?.id, user?.id, session, isSuperAdmin]);

  const isDebugMode = window.location.search.includes('debug=true');
  if (isDebugMode) {
    logger.info("Route analysis", {
      path: location.pathname,
      neighborhoodIdFromUrl,
      isNeighborhoodRoute,
      currentNeighborhoodId: currentNeighborhood?.id,
      isSuperAdmin,
      isLoadingAuth,
      isLoadingNeighborhood,
      isLoadingSuperAdmin
    });
  }

  // Show loading spinner while checking authentication and permissions
  if (isLoadingAuth || (isLoadingNeighborhood && user) || (isCheckingOnboarding && user) || (isLoadingSuperAdmin && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-muted-foreground">
            {isLoadingAuth ? 'Checking authentication...' : 
             isCheckingOnboarding ? 'Checking onboarding status...' : 
             isLoadingSuperAdmin ? 'Checking permissions...' :
             'Loading neighborhood...'}
          </p>
        </div>
      </div>
    );
  }

  // Special case: Allow unauthenticated access to onboarding page if in guest mode
  if (isOnboardingPage(location) && !user && isGuestOnboardingMode) {
    return <>{children}</>;
  }

  // If not authenticated, redirect to landing page
  if (!user || !session) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  // If user needs to complete onboarding, redirect to onboarding page
  if (needsOnboarding && !isOnboardingPage(location)) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // Handle special cases for join pages to avoid infinite loops
  const isJoin = isJoinPage(location);
  const isHome = isHomePage(location);
  
  // If we're on a neighborhood-specific route, validate access
  if (isNeighborhoodRoute && neighborhoodIdFromUrl) {
    // Super admins can access any neighborhood
    if (isSuperAdmin) {
      if (isDebugMode) {
        logger.info("Super admin accessing neighborhood", { neighborhoodIdFromUrl });
      }
      return <>{children}</>;
    }
    
    // Regular users can only access their own neighborhood
    if (currentNeighborhood?.id === neighborhoodIdFromUrl) {
      return <>{children}</>;
    }
    
    // If user tries to access a neighborhood they don't belong to, redirect to their neighborhood
    if (currentNeighborhood?.id && currentNeighborhood.id !== neighborhoodIdFromUrl) {
      const redirectPath = location.pathname.replace(`/n/${neighborhoodIdFromUrl}`, `/n/${currentNeighborhood.id}`);
      if (isDebugMode) {
        logger.info("Redirecting to user's neighborhood", { redirectPath });
      }
      return <Navigate to={redirectPath} replace />;
    }
  }
  
  // Handle legacy routes - redirect to neighborhood-aware URLs if we have a neighborhood
  if (!isNeighborhoodRoute && currentNeighborhood?.id && !isJoin) {
    const newPath = `/n/${currentNeighborhood.id}${location.pathname}`;
    if (isDebugMode) {
      logger.info("Redirecting legacy route to neighborhood-specific URL", { newPath });
    }
    return <Navigate to={newPath} replace />;
  }
  
  // If no neighborhood context but user is on a legacy route, show loading
  if (!isNeighborhoodRoute && !currentNeighborhood && !isJoin && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading neighborhood...</p>
        </div>
      </div>
    );
  }
  
  // If user has no neighborhood and trying to access a page that requires one,
  // redirect to join page - except for the join page itself and home page to avoid loops
  if (!currentNeighborhood && !isJoin && !isHome) {
    if (isDebugMode) {
      logger.info("User has no neighborhood, showing loading state");
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-muted-foreground">Setting up your neighborhood...</p>
        </div>
      </div>
    );
  }

  // User is authenticated and has necessary access, render the protected content
  return <>{children}</>;
};

export default NeighborhoodAwareProtectedRoute;