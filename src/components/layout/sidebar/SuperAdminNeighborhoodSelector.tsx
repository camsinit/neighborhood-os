/**
 * SuperAdminNeighborhoodSelector Component
 * 
 * Allows super admins to switch between different neighborhoods easily.
 * Only visible to users with super_admin role.
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, Users, MapPin, Plus } from 'lucide-react';
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
import { CreateNeighborhoodDialog } from '@/components/neighborhoods/CreateNeighborhoodDialog';
import { useSuperAdminCreateNeighborhood } from '@/hooks/useSuperAdminCreateNeighborhood';

export const SuperAdminNeighborhoodSelector: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { isSuperAdmin } = useSuperAdminAccess();
  const { currentNeighborhood } = useNeighborhood();
  const { data: neighborhoods = [], isLoading } = useSuperAdminNeighborhoods();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Don't render if not super admin
  if (!isSuperAdmin) {
    return null;
  }

  // Handle neighborhood selection
  const handleNeighborhoodSelect = (neighborhoodId: string) => {
    // Navigate to the same page but with the new neighborhood ID
    const currentPath = window.location.pathname;
    const pathWithoutNeighborhood = currentPath.replace(/^\/n\/[^\/]+/, '');
    const newPath = `/n/${neighborhoodId}${pathWithoutNeighborhood || '/home'}`;
    navigate(newPath);
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
              <span className="truncate">{currentNeighborhoodName}</span>
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
      
      {/* Create New Neighborhood Button */}
      <Button 
        variant="ghost" 
        className="w-full mt-2 text-sm font-normal justify-start"
        onClick={() => setIsCreateDialogOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Neighborhood
      </Button>

      {/* Create Neighborhood Dialog */}
      <CreateNeighborhoodDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
};