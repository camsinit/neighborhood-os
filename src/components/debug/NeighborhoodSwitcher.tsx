/**
 * NeighborhoodSwitcher - Super Admin neighborhood switching tool
 * 
 * Allows super admins to actually switch their active neighborhood membership
 * for debugging and management purposes throughout the entire application.
 */
import React, { useState } from 'react';
import { ChevronDown, MapPin, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNeighborhood } from '@/contexts/neighborhood';
import { Neighborhood } from '@/contexts/neighborhood/types';
import { toast } from '@/hooks/use-toast';

interface NeighborhoodOption {
  id: string;
  name: string;
  city?: string;
  state?: string;
  created_at?: string;
  display_name: string;
}

/**
 * Keep debug context for backward compatibility with existing debug tools
 */
const DebugNeighborhoodContext = React.createContext<{
  debugNeighborhood: Neighborhood | null;
  setDebugNeighborhood: (neighborhood: Neighborhood | null) => void;
} | undefined>(undefined);

export const DebugNeighborhoodProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [debugNeighborhood, setDebugNeighborhood] = useState<Neighborhood | null>(null);

  return (
    <DebugNeighborhoodContext.Provider value={{ debugNeighborhood, setDebugNeighborhood }}>
      {children}
    </DebugNeighborhoodContext.Provider>
  );
};

export const useDebugNeighborhood = () => {
  const context = React.useContext(DebugNeighborhoodContext);
  if (context === undefined) {
    throw new Error('useDebugNeighborhood must be used within a DebugNeighborhoodProvider');
  }
  return context;
};

/**
 * NeighborhoodSwitcher Component - Actually switches active neighborhood
 */
export const NeighborhoodSwitcher: React.FC = () => {
  const { currentNeighborhood, refreshNeighborhoodData } = useNeighborhood();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [originalNeighborhood, setOriginalNeighborhood] = useState<Neighborhood | null>(null);
  
  // Fetch all neighborhoods available to super admin
  const { data: neighborhoods, isLoading: isFetchingNeighborhoods } = useQuery({
    queryKey: ['all-neighborhoods-debug'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('neighborhoods')
        .select('id, name, city, state, created_at')
        .order('name');
      
      if (error) throw error;
      
      return data.map((neighborhood): NeighborhoodOption => ({
        ...neighborhood,
        display_name: `${neighborhood.name}${neighborhood.city ? ` - ${neighborhood.city}` : ''}${neighborhood.state ? `, ${neighborhood.state}` : ''}`
      }));
    },
  });

  // Store the original neighborhood when first switching
  React.useEffect(() => {
    if (currentNeighborhood && !originalNeighborhood) {
      setOriginalNeighborhood(currentNeighborhood);
    }
  }, [currentNeighborhood, originalNeighborhood]);

  // Handle actual neighborhood switching
  const handleNeighborhoodSelect = async (neighborhood: NeighborhoodOption) => {
    setIsLoading(true);
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Add user to the selected neighborhood
      const { data, error } = await supabase.rpc('add_neighborhood_member', {
        user_uuid: user.id,
        neighborhood_uuid: neighborhood.id
      });

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Failed to join neighborhood');
      }

      // Refresh the neighborhood context to reflect the change
      refreshNeighborhoodData();
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['neighborhoods'] });
      queryClient.invalidateQueries({ queryKey: ['user-neighborhoods'] });
      
      toast({
        title: "Neighborhood Switched Successfully",
        description: `You are now actively operating in "${neighborhood.display_name}". All data and actions will be in this neighborhood context.`,
      });
      
    } catch (error) {
      console.error('Error switching neighborhood:', error);
      toast({
        title: "Failed to Switch Neighborhood",
        description: error instanceof Error ? error.message : "An unexpected error occurred while switching neighborhoods.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Return to original neighborhood
  const handleReturnToOriginal = async () => {
    if (!originalNeighborhood) {
      toast({
        title: "No Original Neighborhood",
        description: "No original neighborhood to return to.",
        variant: "destructive",
      });
      return;
    }

    await handleNeighborhoodSelect({
      id: originalNeighborhood.id,
      name: originalNeighborhood.name,
      display_name: originalNeighborhood.name
    });
  };

  const isActivelySwitched = originalNeighborhood && currentNeighborhood?.id !== originalNeighborhood.id;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Active Neighborhood Switcher</h3>
          <p className="text-sm text-muted-foreground">
            Switch your active neighborhood membership to operate in different communities.
          </p>
        </div>
        
        {isActivelySwitched && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReturnToOriginal}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <RotateCcw className="w-4 h-4" />
            Return to Original
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 min-w-[200px] justify-between bg-background border-2 shadow-sm hover:bg-accent z-50"
              disabled={isFetchingNeighborhoods || isLoading}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="truncate">
                  {currentNeighborhood?.name || 'No neighborhood selected'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent 
            className="w-[300px] max-h-[300px] overflow-y-auto bg-background border shadow-lg z-50"
            align="start"
          >
            <DropdownMenuLabel className="font-semibold">
              Switch to Neighborhood
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {isFetchingNeighborhoods ? (
              <DropdownMenuItem disabled>
                <span className="text-muted-foreground">Loading neighborhoods...</span>
              </DropdownMenuItem>
            ) : neighborhoods && neighborhoods.length > 0 ? (
              neighborhoods.map((neighborhood) => (
                <DropdownMenuItem
                  key={neighborhood.id}
                  onClick={() => handleNeighborhoodSelect(neighborhood)}
                  className={`cursor-pointer hover:bg-accent focus:bg-accent ${
                    currentNeighborhood?.id === neighborhood.id ? 'bg-accent font-medium' : ''
                  }`}
                  disabled={isLoading}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {neighborhood.name}
                      {currentNeighborhood?.id === neighborhood.id && (
                        <span className="ml-2 text-xs text-primary">(Current)</span>
                      )}
                    </span>
                    {(neighborhood.city || neighborhood.state) && (
                      <span className="text-sm text-muted-foreground">
                        {neighborhood.city}{neighborhood.city && neighborhood.state ? ', ' : ''}{neighborhood.state}
                      </span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>
                <span className="text-muted-foreground">No neighborhoods found</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {isActivelySwitched && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">ACTIVE SWITCH:</span>
            <span>Operating in {currentNeighborhood?.name}</span>
          </div>
        )}
        
        {isLoading && (
          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
            <span className="font-medium">Switching neighborhoods...</span>
          </div>
        )}
      </div>
    </div>
  );
};