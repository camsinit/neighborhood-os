
/**
 * SuperAdminRoute component
 * 
 * A specialized route protection component that ensures only users with 
 * the 'super_admin' role can access certain pages, like the Debug page.
 * 
 * If the user is not a super admin, they'll be redirected to the home page
 * with an appropriate error message.
 */
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSuperAdminAccess } from '@/hooks/useSuperAdminAccess';
import { toast } from 'sonner';

interface SuperAdminRouteProps {
  children: ReactNode;
}

/**
 * SuperAdminRoute protects routes that should only be accessible to Super Admins
 * 
 * @param children - The component(s) to render if the user has super admin access
 */
const SuperAdminRoute = ({ children }: SuperAdminRouteProps) => {
  const { isSuperAdmin, isLoading } = useSuperAdminAccess();

  // Show loading state while checking permissions
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // If user is not a super admin, show error and redirect to their neighborhood home
  if (!isSuperAdmin) {
    toast.error('Access denied. Super Admin privileges required.');
    return <Navigate to="/dashboard" replace />;
  }

  // User has super admin access, render the protected content
  return <>{children}</>;
};

export default SuperAdminRoute;
