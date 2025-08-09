/**
 * SuperAdminNeighborhoodSelector Component
 * 
 * Allows super admins to switch between different neighborhoods easily.
 * Only visible to users with super_admin role.
 */
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, Users, MapPin, Eye, UserCheck } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useSuperAdminAccess } from '@/hooks/useSuperAdminAccess';
import { useSuperAdminNeighborhoods } from '@/hooks/useSuperAdminNeighborhoods';
import { useNeighborhood } from '@/contexts/neighborhood';
import { useGhostMode } from '@/hooks/useActualMembership';
import { BASE_ROUTES } from '@/utils/routes';


export const SuperAdminNeighborhoodSelector: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { isSuperAdmin } = useSuperAdminAccess();
  const { currentNeighborhood } = useNeighborhood();
  const { data: neighborhoods = [], isLoading } = useSuperAdminNeighborhoods();
  
  // Check ghost mode status for current neighborhood
  const { isGhostMode, isActualMember } = useGhostMode(currentNeighborhood?.id || null);
  
  // Don't render if not super admin
  if (!isSuperAdmin) {
    return null;
  }

  // Simplified and reliable neighborhood selection handler
  const handleNeighborhoodSelect = (neighborhoodId: string) => {
    const currentPath = window.location.pathname;
    const pathWithoutNeighborhood = currentPath.replace(/^\/n\/[^\/]+/, '');
    // Use centralized route for home as fallback to avoid hardcoded paths
    const newPath = `/n/${neighborhoodId}${pathWithoutNeighborhood || BASE_ROUTES.home}`;
    navigate(newPath, { replace: true }); // Use replace to avoid navigation history buildup
  };

  // Get the current neighborhood from URL params
  const currentNeighborhoodId = params.neighborhoodId || currentNeighborhood?.id;
  const currentNeighborhoodName = neighborhoods.find(n => n.id === currentNeighborhoodId)?.name || 
                                   currentNeighborhood?.name || 
                                   'Select Neighborhood';

  return (
    <div className="px-3 pb-3">
      <div className="text-xs font-medium text-muted-foreground mb-2">
        SUPER ADMIN
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between text-sm font-normal"
            disabled={isLoading}
          >
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <div className="flex flex-col items-start min-w-0">
                <span className="truncate text-sm">{currentNeighborhoodName}</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {isGhostMode ? (
                    <>
                      <Eye className="h-3 w-3" />
                      Observer
                    </>
                  ) : isActualMember ? (
                    <>
                      <UserCheck className="h-3 w-3" />
                      Member
                    </>
                  ) : (
                    'Admin'
                  )}
                </div>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Switch Neighborhood</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {isLoading ? (
            <DropdownMenuItem disabled>
              Loading neighborhoods...
            </DropdownMenuItem>
          ) : neighborhoods.length === 0 ? (
            <DropdownMenuItem disabled>
              No neighborhoods found
            </DropdownMenuItem>
          ) : (
            neighborhoods.map((neighborhood) => (
              <DropdownMenuItem
                key={neighborhood.id}
                onClick={() => handleNeighborhoodSelect(neighborhood.id)}
                className={`cursor-pointer ${
                  neighborhood.id === currentNeighborhoodId ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col">
                    <span className="font-medium">{neighborhood.name}</span>
                    {neighborhood.city && neighborhood.state && (
                      <span className="text-xs text-muted-foreground">
                        {neighborhood.city}, {neighborhood.state}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{neighborhood.member_count}</span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};