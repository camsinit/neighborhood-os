import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, X, UserPlus } from 'lucide-react';
import { useNeighborhoodMembers, NeighborhoodMember } from '@/hooks/useNeighborhoodMembers';
import { useUser } from '@supabase/auth-helpers-react';

interface NeighborSearchProps {
  selectedNeighbors: NeighborhoodMember[];
  onNeighborSelect: (neighbor: NeighborhoodMember) => void;
  onNeighborRemove: (neighborId: string) => void;
}

/**
 * NeighborSearch component allows group creators to search for and preemptively
 * invite neighbors to the group they're creating
 */
export const NeighborSearch: React.FC<NeighborSearchProps> = ({
  selectedNeighbors,
  onNeighborSelect,
  onNeighborRemove
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: allMembers = [], isLoading } = useNeighborhoodMembers();
  const user = useUser();

  // Filter members based on search term and exclude current user and already selected neighbors
  const filteredMembers = useMemo(() => {
    if (!allMembers.length) return [];
    
    return allMembers.filter(member => {
      // Exclude current user
      if (member.user_id === user?.id) return false;
      
      // Exclude already selected neighbors
      if (selectedNeighbors.some(selected => selected.user_id === member.user_id)) return false;
      
      // Filter by search term
      if (searchTerm) {
        const displayName = member.display_name?.toLowerCase() || '';
        return displayName.includes(searchTerm.toLowerCase());
      }
      
      return true;
    });
  }, [allMembers, searchTerm, selectedNeighbors, user?.id]);

  // Show limited results to avoid overwhelming the UI
  const displayMembers = filteredMembers.slice(0, 8);

  const handleNeighborSelect = (neighbor: NeighborhoodMember) => {
    onNeighborSelect(neighbor);
    setSearchTerm(''); // Clear search after selection
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <Label className="text-lg font-bold">Invite Neighbors</Label>
        <p className="text-sm text-gray-600">
          Search and select neighbors to invite to your group when it's created
        </p>
      </div>

      {/* Selected neighbors display */}
      {selectedNeighbors.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Selected neighbors to invite:</Label>
          <div className="flex flex-wrap gap-2">
            {selectedNeighbors.map(neighbor => (
              <Badge 
                key={neighbor.user_id} 
                variant="secondary" 
                className="flex items-center gap-2 px-3 py-1"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={neighbor.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {neighbor.display_name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{neighbor.display_name || 'Anonymous'}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => onNeighborRemove(neighbor.user_id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          
          {/* Search input - positioned under selected neighbors */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search neighbors by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Search input when no neighbors selected - positioned after header */}
      {selectedNeighbors.length === 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search neighbors by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Search results */}
      {searchTerm && (
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-sm text-gray-500 py-2">Searching neighbors...</p>
          ) : displayMembers.length > 0 ? (
            <div className="space-y-1 max-h-48 overflow-y-auto border rounded-md p-2">
              {displayMembers.map(member => (
                <Button
                  key={member.user_id}
                  type="button"
                  variant="ghost"
                  className="w-full justify-start h-auto p-2"
                  onClick={() => handleNeighborSelect(member)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.display_name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{member.display_name || 'Anonymous'}</p>
                      {member.neighborhood_role !== 'neighbor' && (
                        <p className="text-xs text-gray-500 capitalize">
                          {member.neighborhood_role}
                        </p>
                      )}
                    </div>
                    <UserPlus className="h-4 w-4" />
                  </div>
                </Button>
              ))}
              {filteredMembers.length > displayMembers.length && (
                <p className="text-xs text-gray-500 text-center py-1">
                  +{filteredMembers.length - displayMembers.length} more results
                </p>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500 py-4 text-center space-y-2">
              <p>No neighbors found matching "{searchTerm}"</p>
              {(() => {
                const currentUserName = user?.user_metadata?.display_name?.toLowerCase() || '';
                const searchLower = searchTerm.toLowerCase();
                const isSearchingForSelf = currentUserName.includes(searchLower) || 
                  currentUserName.split(' ').some(part => part.startsWith(searchLower));
                
                return isSearchingForSelf ? (
                  <p className="text-xs text-blue-600 font-medium">
                    💡 You can't invite yourself to your own group
                  </p>
                ) : null;
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};