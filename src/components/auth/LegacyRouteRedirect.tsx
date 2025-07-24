/**
 * LegacyRouteRedirect Component
 * 
 * Handles redirecting from legacy routes to neighborhood-specific URLs.
 * For super admins, it allows accessing any neighborhood.
 * For regular users, it redirects to their default neighborhood.
 */
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNeighborhood } from '@/contexts/neighborhood';
import { useSuperAdminAccess } from '@/hooks/useSuperAdminAccess';

export const LegacyRouteRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentNeighborhood } = useNeighborhood();
  const { isSuperAdmin } = useSuperAdminAccess();

  useEffect(() => {
    // Skip redirect logic if we're already on a neighborhood-specific route
    if (location.pathname.startsWith('/n/')) {
      return;
    }

    // Skip redirect for certain routes that don't need neighborhoods
    const skipRoutes = ['/dashboard', '/onboarding', '/debug'];
    if (skipRoutes.some(route => location.pathname.startsWith(route))) {
      return;
    }

    // If we have a current neighborhood, redirect to the neighborhood-specific URL
    if (currentNeighborhood?.id) {
      const newPath = `/n/${currentNeighborhood.id}${location.pathname}`;
      console.log(`[LegacyRouteRedirect] Redirecting from ${location.pathname} to ${newPath}`);
      navigate(newPath, { replace: true });
    }
  }, [location.pathname, currentNeighborhood, navigate, isSuperAdmin]);

  return <>{children}</>;
};