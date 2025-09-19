import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppSheetContent } from '@/components/ui/app-sheet-content';
import { PhysicalUnitActivityTimeline } from './activity/PhysicalUnitActivityTimeline';
import { 
  Users, 
  MapPin,
  Home,
  User,
  Plus,
  Share2,
  Edit,
  Settings
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('PhysicalUnitSheetContent');

/**
 * PhysicalUnitSheetContent Component
 * 
 * Universal side-panel component for displaying detailed physical unit information.
 * Follows the same structure as GroupSheetContent for universal interface consistency.
 * 
 * Features:
 * - Header section with title, metadata, and action buttons (matches social groups)
 * - Activity timeline with events, updates, and resident movements
 * - Consistent layout, spacing, and design patterns
 * - Purple accent theme for physical units
 */
interface PhysicalUnitSheetContentProps {
  unit: {
    unit_name: string;
    unit_label: string;
    residents: Array<{
      user_id: string;
      profiles: {
        id: string;
        display_name: string | null;
        avatar_url: string | null;
      };
    }>;
    resident_count: number;
  };
  onOpenChange?: (open: boolean) => void;
}

const PhysicalUnitSheetContent = ({ unit, onOpenChange }: PhysicalUnitSheetContentProps) => {
  // State management (matching social groups structure)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [neighborhoodId, setNeighborhoodId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get current user and neighborhood on mount
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);

        if (user?.id) {
          // Get neighborhood ID for this user 
          const { data: membership } = await supabase
            .from('neighborhood_members')
            .select('neighborhood_id')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single();
          
          setNeighborhoodId(membership?.neighborhood_id || null);
        }

        logger.info('Current user loaded for physical unit sheet', { 
          userId: user?.id,
          unitName: unit.unit_name,
          neighborhoodId
        });
      } catch (error) {
        logger.error('Error getting current user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentUser();
  }, [unit.unit_name]);

  // Prepare member avatars for display (limit to first 3 for header)
  const memberAvatars = unit.residents.slice(0, 3);
  const additionalMemberCount = Math.max(0, unit.resident_count - 3);

  // Check if current user is a resident of this unit
  const isUserResident = currentUserId && unit.residents.some(
    resident => resident.profiles.id === currentUserId
  );

  // Handle sharing unit
  const handleShare = () => {
    // TODO: Implement sharing functionality
    const unitUrl = `${window.location.origin}/unit/${encodeURIComponent(unit.unit_name)}`;
    navigator.clipboard.writeText(unitUrl);
    // TODO: Add toast notification for successful copy
  };

  // Handle editing unit (for authorized users)
  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log('Edit unit:', unit.unit_name);
  };

  logger.info('Physical unit sheet rendered', {
    unitName: unit.unit_name,
    residentCount: unit.resident_count,
    isUserResident,
    currentUserId,
    neighborhoodId
  });

  return (
    <AppSheetContent 
      moduleTheme="neighbors" 
      className="overflow-y-auto"
    >
      <div className="space-y-6 pt-6">
        {/* Header Section - Matching social groups structure exactly */}
        <div className="space-y-4">
          {/* Unit title and actions row - matches social groups layout */}
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {unit.unit_name}
            </h1>
            
            {/* Action buttons on the right - matches social groups */}
            <div className="flex items-center gap-2 ml-4">
              <button 
                onClick={handleShare}
                className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-600 transition-colors" 
                aria-label="Share unit"
              >
                <Share2 className="h-4 w-4" />
              </button>
              
              {isUserResident && (
                <button 
                  onClick={handleEdit}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors" 
                  aria-label="Edit unit"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Unit metadata row - matches social groups format exactly */}
          <div className="flex items-center gap-2 text-gray-600">
            {/* Profile images on the left */}
            <div className="flex -space-x-1">
              {memberAvatars.map((resident) => (
                <Avatar key={resident.user_id} className="h-10 w-10 border-2 border-white">
                  <AvatarImage src={resident.profiles?.avatar_url || ''} />
                  <AvatarFallback className="text-sm">
                    {resident.profiles?.display_name?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
              ))}
              {additionalMemberCount > 0 && (
                <div className="h-10 w-10 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    +{additionalMemberCount}
                  </span>
                </div>
              )}
            </div>
            
            {/* Unit metadata - matches social groups pattern */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                {unit.resident_count === 1 ? '1 resident' : `${unit.resident_count} residents`}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                🏠 Physical Unit
              </span>
              <span>•</span>
              <span>{unit.unit_label.slice(0, -1)}</span>
            </div>
          </div>
        </div>

        {/* Separator - matches social groups */}
        <div className="border-t border-gray-200" />

        {/* Activity Timeline - matches social groups structure */}
        {neighborhoodId && (
          <PhysicalUnitActivityTimeline
            unitName={unit.unit_name}
            unitLabel={unit.unit_label}
            neighborhoodId={neighborhoodId}
            isUnitResident={isUserResident}
            showInviteButton={isUserResident}
            onInvite={() => {
              // TODO: Implement invite functionality
              console.log('Invite neighbors to unit');
            }}
          />
        )}

        {/* Loading state for timeline */}
        {!neighborhoodId && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <Home className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Unable to load unit activities</p>
          </div>
        )}
      </div>
    </AppSheetContent>
  );
};

export default PhysicalUnitSheetContent;