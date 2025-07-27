/**
 * Ghost Mode Indicator Component
 * 
 * Shows visual feedback when a super admin is in "ghost mode" - 
 * observing a neighborhood without being an actual member.
 */
import React from 'react';
import { Eye, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useGhostMode } from '@/hooks/useActualMembership';
import { useSuperAdminNeighborhoodCreation } from '@/hooks/useSuperAdminNeighborhoodCreation';
import { useCurrentNeighborhood } from '@/hooks/useCurrentNeighborhood';

interface GhostModeIndicatorProps {
  /**
   * Optional custom className for styling
   */
  className?: string;
}

/**
 * Component that displays ghost mode status and join option for super admins
 */
export const GhostModeIndicator: React.FC<GhostModeIndicatorProps> = ({ 
  className = "" 
}) => {
  const currentNeighborhood = useCurrentNeighborhood();
  const { isGhostMode, isActualMember, canPost } = useGhostMode(currentNeighborhood?.id || null);
  const { joinAsActualMember } = useSuperAdminNeighborhoodCreation();
  
  // Only show if in ghost mode
  if (!isGhostMode || !currentNeighborhood) {
    return null;
  }
  
  /**
   * Handles joining as actual member when super admin wants to participate
   */
  const handleJoinAsMember = async () => {
    if (currentNeighborhood?.id) {
      await joinAsActualMember(currentNeighborhood.id);
      // The page should refresh or update membership status automatically
    }
  };
  
  return (
    <div className={`flex items-center gap-2 rounded-lg border border-warning/20 bg-warning/5 px-3 py-2 ${className}`}>
      {/* Ghost Mode Icon and Status */}
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Observer Mode</span>
      </div>
      
      {/* Explanatory Text */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs text-muted-foreground cursor-help">
              Viewing as ghost admin
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">
              You're observing this neighborhood for debugging purposes. 
              You can view all content but cannot post or engage.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Join as Member Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleJoinAsMember}
        className="ml-auto text-xs"
      >
        <UserPlus className="h-3 w-3 mr-1" />
        Join as Member
      </Button>
    </div>
  );
};