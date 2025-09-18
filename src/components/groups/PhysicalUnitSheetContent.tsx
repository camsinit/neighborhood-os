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
      moduleTheme="neighbors" 
      className="overflow-y-auto"
    >
      <div className="space-y-6 pt-6">
        {/* Physical Unit Header Section - Main unit information display */}
        <div className="space-y-4">
          {/* Clean unit title (matching social groups structure) */}
          <h1 className="text-2xl font-semibold text-gray-900">{unit.unit_name}</h1>
          
          {/* Unit metadata with profile images - matches social groups format exactly */}
          <div className="flex items-center gap-2 text-gray-600">
            {/* Profile images on the left - shows visual representation of residents */}
            <div className="flex -space-x-1">
              {memberAvatars.slice(0, 3).map((resident) => (
                <Avatar key={resident.user_id} className="h-5 w-5 border border-white">
                  <AvatarImage src={resident.profiles?.avatar_url || ''} />
                  <AvatarFallback className="text-xs">
                    {resident.profiles?.display_name?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
              ))}
              {additionalMemberCount > 0 && (
                <div className="h-5 w-5 rounded-full bg-gray-100 border border-white flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    +{additionalMemberCount}
                  </span>
                </div>
              )}
            </div>
            {/* Resident count - matches "X neighbors" format from social groups */}
            <span className="text-sm text-gray-600">
              {unit.resident_count === 1 ? '1 resident' : `${unit.resident_count} residents`}
            </span>
            {/* Unit type indicator - matches "Private/Public group" format */}
            <span className="text-sm text-gray-600">
              {unit.unit_label.slice(0, -1)}
            </span>
          </div>
        </div>

        {/* Residents Section - Simple list matching social groups style */}
        {unit.resident_count > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Residents ({unit.resident_count})
            </h3>
            
            {/* Resident list - clean, simple styling like social groups */}
            <div className="space-y-3">
              {unit.residents.map((resident) => (
                <div 
                  key={resident.user_id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Resident avatar */}
                  <Avatar className="h-10 w-10">
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
                  </div>

                  {/* Action button for each resident */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-70 hover:opacity-100"
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

        {/* Action buttons section - integrated naturally like social groups */}
        {currentUserId && (
          <div className="flex items-center gap-3">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Invite Neighbors
            </Button>
          </div>
        )}
      </div>
    </AppSheetContent>
  );
};

export default PhysicalUnitSheetContent;