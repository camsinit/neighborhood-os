import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Loader2, Home } from 'lucide-react';
import { useNeighborhoodPhysicalConfig, usePhysicalUnitsWithResidents } from '@/hooks/useGroups';

interface PhysicalUnitsViewProps {
  searchQuery: string;
}

/**
 * PhysicalUnitsView Component
 * 
 * Displays the physical units (streets, floors, blocks, etc.) configured for the neighborhood.
 * Shows each physical unit as a card with optional associated group information.
 * The title and content adapt to the admin's configured physical unit type.
 */
export const PhysicalUnitsView: React.FC<PhysicalUnitsViewProps> = ({
  searchQuery
}) => {
  // Get the neighborhood's physical unit configuration and units with resident assignments
  const { data: physicalConfig, isLoading: configLoading } = useNeighborhoodPhysicalConfig();
  const { data: unitsWithResidents = [], isLoading: unitsLoading } = usePhysicalUnitsWithResidents();

  // Filter units based on search query
  const filteredUnits = unitsWithResidents.filter(unit =>
    unit.unit_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state
  if (configLoading || unitsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading {physicalConfig?.physical_unit_label?.toLowerCase() || 'units'}...</span>
        </div>
      </div>
    );
  }

  // No physical units configured
  if (!physicalConfig || !physicalConfig.physical_units || physicalConfig.physical_units.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Home className="h-12 w-12 mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">No Physical Units Configured</h3>
        <p className="text-center max-w-md">
          Your neighborhood admin hasn't set up physical units yet. 
          Physical units help organize neighbors by location (streets, floors, blocks, etc.).
        </p>
      </div>
    );
  }

  // No search results
  if (searchQuery && filteredUnits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="text-lg">No {physicalConfig.physical_unit_label?.toLowerCase()} found matching "{searchQuery}"</p>
        <p className="text-sm">Try a different search term</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with unit count */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            {physicalConfig.physical_unit_label}
          </h2>
        </div>
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          {filteredUnits.length}
        </Badge>
      </div>

      {/* Physical units grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUnits.map((unit) => (
          <PhysicalUnitCard
            key={unit.unit_name}
            unit={unit}
            unitLabel={physicalConfig.physical_unit_label}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * PhysicalUnitCard Component
 * 
 * Individual card for each physical unit showing the unit name and assigned residents.
 * The admin creates the unit which represents the physical organization structure.
 */
interface PhysicalUnitCardProps {
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
  unitLabel: string;
}

const PhysicalUnitCard: React.FC<PhysicalUnitCardProps> = ({ unit, unitLabel }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Unit header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate text-gray-900">
                {unit.unit_name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">
                  {unitLabel.slice(0, -1)} {/* Remove 's' from plural form */}
                </span>
              </div>
            </div>
            {/* Resident count badge */}
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {unit.resident_count}
            </Badge>
          </div>

          {/* Resident assignments - only show if there are residents */}
          {unit.resident_count > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-gray-900">
                  {unit.resident_count} {unit.resident_count === 1 ? 'Resident' : 'Residents'}
                </span>
              </div>
              
              {/* Show first few residents */}
              <div className="space-y-1">
                {unit.residents.slice(0, 3).map((resident) => (
                  <div key={resident.user_id} className="text-xs text-gray-600">
                    • {resident.profiles.display_name || 'Anonymous Neighbor'}
                  </div>
                ))}
                {unit.resident_count > 3 && (
                  <div className="text-xs text-gray-500">
                    + {unit.resident_count - 3} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty state for no residents */}
          {unit.resident_count === 0 && (
            <div className="flex items-center gap-2 text-gray-500">
              <Users className="h-4 w-4" />
              <span className="text-sm">No residents assigned yet</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};