import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppSheetContent } from '@/components/ui/app-sheet-content';
import { 
  Users, 
  MapPin,
  Home,
  User,
  Plus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('PhysicalUnitSheetContent');

/**
 * PhysicalUnitSheetContent Component
 * 
 * Universal side-panel component for displaying detailed physical unit information.
 * Adapted from GroupSheetContent to show street/unit-specific data and residents.
 * 
 * Features:
 * - Clean white background with consistent module theming
 * - Physical unit name and type display
 * - Resident avatar stack with count
 * - List of assigned residents with profiles
 * - Responsive design that works on mobile and desktop
 * - Action buttons for residents (invite neighbors, etc.)
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
  // State for current user 
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get current user on mount
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);
        logger.info('Current user loaded for physical unit sheet', { 
          userId: user?.id,
          unitName: unit.unit_name 
        });
      } catch (error) {
        logger.error('Error getting current user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentUser();
  }, [unit.unit_name]);

  // Prepare member avatars for display (limit to first 5)
  const memberAvatars = unit.residents.slice(0, 5);
  const additionalMemberCount = Math.max(0, unit.resident_count - 5);

  // Check if current user is a resident of this unit
  const isUserResident = currentUserId && unit.residents.some(
    resident => resident.profiles.id === currentUserId
  );

  logger.info('Physical unit sheet rendered', {
    unitName: unit.unit_name,
    residentCount: unit.resident_count,
    isUserResident,
    currentUserId
  });

  return (
    <AppSheetContent 
      className="w-full max-w-2xl mx-auto bg-white border-0 p-0"
    >
      {/* Header Section - Physical Unit Information */}
      <div className="space-y-6 p-6">
        {/* Physical Unit Header Section - Main unit information display */}
        <div className="space-y-4">
          {/* Top row: Unit name and type indicator */}
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{unit.unit_name}</h1>
            <Home className="h-6 w-6 text-blue-500" />
          </div>
          
          {/* Unit type and resident count on second line */}
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span className="text-sm">
              {unit.unit_label.slice(0, -1)} • {unit.resident_count} {unit.resident_count === 1 ? 'resident' : 'residents'}
            </span>
          </div>

          {/* Bottom row: Resident avatars on left, action buttons on right */}
          <div className="flex items-center justify-between">
            {/* Left side: Resident avatar stack - shows visual representation of unit residents */}
            <div className="flex -space-x-2">
              {memberAvatars.map((resident) => (
                <Avatar key={resident.user_id} className="h-10 w-10 border-2 border-white">
                  <AvatarImage src={resident.profiles?.avatar_url || ''} />
                  <AvatarFallback className="text-xs">
                    {resident.profiles?.display_name?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
              ))}
              {/* Show additional resident count if more than 5 residents */}
              {additionalMemberCount > 0 && (
                <div className="h-10 w-10 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    +{additionalMemberCount}
                  </span>
                </div>
              )}
            </div>

            {/* Right side: Action buttons - contextual based on residency */}
            <div className="flex items-center gap-3">
              {currentUserId && (
                <>
                  {/* Invite neighbors button - available to all neighborhood members */}
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Invite Neighbors
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Residents Section - List all residents with their profiles */}
        {unit.resident_count > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">
                Residents ({unit.resident_count})
              </h2>
            </div>
            
            {/* Resident list - shows all residents with their information */}
            <div className="space-y-3">
              {unit.residents.map((resident) => (
                <div 
                  key={resident.user_id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {/* Resident avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={resident.profiles?.avatar_url || ''} />
                    <AvatarFallback>
                      {resident.profiles?.display_name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Resident info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">
                        {resident.profiles?.display_name || 'Anonymous Resident'}
                      </p>
                      {/* Badge for current user */}
                      {resident.profiles.id === currentUserId && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Lives on {unit.unit_name}
                    </p>
                  </div>

                  {/* Action button for each resident */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gray-200"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state for units with no residents */}
        {unit.resident_count === 0 && (
          <div className="text-center py-8 space-y-3">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Home className="h-8 w-8 text-gray-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-gray-900">No residents assigned</h3>
              <p className="text-sm text-gray-600">
                This {unit.unit_label.slice(0, -1).toLowerCase()} doesn't have any residents assigned yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppSheetContent>
  );
};

export default PhysicalUnitSheetContent;