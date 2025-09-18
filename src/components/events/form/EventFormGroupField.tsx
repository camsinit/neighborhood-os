import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGroups } from "@/hooks/useGroups";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

/**
 * Props for the EventFormGroupField component
 */
interface EventFormGroupFieldProps {
  selectedGroupId?: string;
  onGroupChange: (groupId: string | undefined) => void;
}

/**
 * Interface for grouped groups data structure
 * Groups are organized by Physical Grouping (like "Street") and then by Group type
 */
interface GroupedGroups {
  physicalGroups: Record<string, any[]>;
  regularGroups: any[];
}

/**
 * Component that renders the group selection field for events
 * 
 * This component provides a searchable dropdown that groups available groups by:
 * - Physical Groupings (like "Street" groups with their physical unit values)
 * - Regular Groups (organized by group type)
 * Only shows groups that the user is a member of.
 */
const EventFormGroupField = ({
  selectedGroupId,
  onGroupChange
}: EventFormGroupFieldProps) => {
  // State for managing the dropdown and search functionality
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get user's groups using the existing hook
  const { data: userGroups, isLoading } = useGroups({ 
    includeCurrentUserMembership: true 
  });

  // Filter to only show groups where the user is a member
  const memberGroups = userGroups?.filter(group => 
    group.current_user_membership
  ) || [];

  // Find the currently selected group for display
  const selectedGroup = memberGroups.find(group => group.id === selectedGroupId);

  /**
   * Groups the member groups by physical groupings and regular groups
   * Physical groups are those with physical_unit_value, regular groups are standard groups
   */
  const groupedGroups: GroupedGroups = memberGroups.reduce((acc, group) => {
    // If group has a physical unit value, it's a physical grouping (like "Street")
    if (group.physical_unit_value) {
      const physicalType = group.group_type || 'Other';
      if (!acc.physicalGroups[physicalType]) {
        acc.physicalGroups[physicalType] = [];
      }
      acc.physicalGroups[physicalType].push(group);
    } else {
      // Regular groups organized by type
      acc.regularGroups.push(group);
    }
    return acc;
  }, { physicalGroups: {}, regularGroups: [] } as GroupedGroups);

  /**
   * Filters groups based on the search term
   * Searches through group names and physical unit values
   */
  const getFilteredGroups = (): GroupedGroups => {
    if (!searchTerm.toLowerCase().trim()) {
      return groupedGroups;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered: GroupedGroups = { physicalGroups: {}, regularGroups: [] };
    
    // Filter physical groups
    Object.entries(groupedGroups.physicalGroups).forEach(([type, groups]) => {
      const filteredPhysicalGroups = groups.filter(group => 
        group.name.toLowerCase().includes(term) || 
        group.physical_unit_value?.toLowerCase().includes(term)
      );
      if (filteredPhysicalGroups.length > 0) {
        filtered.physicalGroups[type] = filteredPhysicalGroups;
      }
    });
    
    // Filter regular groups
    filtered.regularGroups = groupedGroups.regularGroups.filter(group =>
      group.name.toLowerCase().includes(term)
    );
    
    return filtered;
  };

  const filteredGroups = getFilteredGroups();

  /**
   * Handles group selection and closes the dropdown
   */
  const handleGroupSelect = (groupId: string | undefined) => {
    onGroupChange(groupId);
    setIsOpen(false);
    setSearchTerm(""); // Clear search when selection is made
  };

  /**
   * Closes dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="space-y-2">
      <Label htmlFor="group">Group (Optional)</Label>
      <div className="relative" ref={dropdownRef}>
        {/* Main trigger button that shows selected group or placeholder */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between h-10 px-3 py-2 text-left"
        >
          <span className="truncate">
            {selectedGroup ? (
              <span>
                {selectedGroup.name}
                {selectedGroup.physical_unit_value && (
                  <span className="text-muted-foreground ml-1">
                    ({selectedGroup.physical_unit_value})
                  </span>
                )}
              </span>
            ) : (
              "Select a group (optional)"
            )}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>

        {/* Dropdown content with search and grouped options */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg">
            {/* Search input at the top */}
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8"
                  autoFocus
                />
              </div>
            </div>

            {/* Scrollable content area with fixed height */}
            <div className="max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="p-2 text-center text-muted-foreground">
                  Loading groups...
                </div>
              ) : (
                <div className="p-1">
                  {/* "No group" option at the top */}
                  <div
                    className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm"
                    onClick={() => handleGroupSelect(undefined)}
                  >
                    <div className="w-4 h-4 mr-2 flex items-center justify-center">
                      {!selectedGroupId && <Check className="h-3 w-3" />}
                    </div>
                    <span className="text-sm">No group</span>
                  </div>

                  {/* Physical Groups Section */}
                  {Object.entries(filteredGroups.physicalGroups).map(([physicalType, groups]) => (
                    <div key={physicalType} className="mt-2">
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {physicalType}s {/* Add 's' to make it plural like "Streets" */}
                      </div>
                      {groups.map((group) => (
                        <div
                          key={group.id}
                          className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm ml-2"
                          onClick={() => handleGroupSelect(group.id)}
                        >
                          <div className="w-4 h-4 mr-2 flex items-center justify-center">
                            {selectedGroupId === group.id && <Check className="h-3 w-3" />}
                          </div>
                          <div className="flex-1">
                            <span className="text-sm">{group.name}</span>
                            {group.physical_unit_value && (
                              <span className="text-xs text-muted-foreground ml-1">
                                ({group.physical_unit_value})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Regular Groups Section */}
                  {filteredGroups.regularGroups.length > 0 && (
                    <div className="mt-2">
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Groups
                      </div>
                      {filteredGroups.regularGroups.map((group) => (
                        <div
                          key={group.id}
                          className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm ml-2"
                          onClick={() => handleGroupSelect(group.id)}
                        >
                          <div className="w-4 h-4 mr-2 flex items-center justify-center">
                            {selectedGroupId === group.id && <Check className="h-3 w-3" />}
                          </div>
                          <span className="text-sm">{group.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No results message */}
                  {Object.keys(filteredGroups.physicalGroups).length === 0 && 
                   filteredGroups.regularGroups.length === 0 && 
                   searchTerm && (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      No groups found matching "{searchTerm}"
                    </div>
                  )}

                  {/* No groups available message */}
                  {memberGroups.length === 0 && !isLoading && (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      No groups available
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventFormGroupField;