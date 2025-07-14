/**
 * NeighborhoodSwitcher - Super Admin debugging tool
 * 
 * Allows super admins to temporarily switch neighborhood context for debugging purposes.
 * This doesn't change actual membership, just the current viewing context.
 */
import React, { useState } from 'react';
import { ChevronDown, MapPin, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
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
 * Create a context override for debugging purposes
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
 * NeighborhoodSwitcher Component
 */
export const NeighborhoodSwitcher: React.FC = () => {
  const { currentNeighborhood } = useNeighborhood();
  const { debugNeighborhood, setDebugNeighborhood } = useDebugNeighborhood();
  
  // Fetch all neighborhoods available to super admin
  const { data: neighborhoods, isLoading } = useQuery({
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

  // Handle neighborhood selection
  const handleNeighborhoodSelect = (neighborhood: NeighborhoodOption) => {
    const debugNeighborhood: Neighborhood = {
      id: neighborhood.id,
      name: neighborhood.name,
    };
    setDebugNeighborhood(debugNeighborhood);
    toast({
      title: "Debug Mode Active",
      description: `Now viewing data from "${neighborhood.display_name}" for debugging purposes.`,
    });
  };

  // Reset to original neighborhood
  const handleReset = () => {
    setDebugNeighborhood(null);
    toast({
      title: "Debug Mode Disabled",
      description: "Returned to your original neighborhood context.",
    });
  };

  const currentDisplay = debugNeighborhood || currentNeighborhood;
  const isInDebugMode = debugNeighborhood !== null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Neighborhood Context Switcher</h3>
          <p className="text-sm text-muted-foreground">
            Temporarily switch to another neighborhood's data for debugging purposes.
          </p>
        </div>
        
        {isInDebugMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 min-w-[200px] justify-between bg-background border-2 shadow-sm hover:bg-accent z-50"
              disabled={isLoading}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="truncate">
                  {currentDisplay?.name || 'No neighborhood selected'}
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
              Available Neighborhoods
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {isLoading ? (
              <DropdownMenuItem disabled>
                <span className="text-muted-foreground">Loading neighborhoods...</span>
              </DropdownMenuItem>
            ) : neighborhoods && neighborhoods.length > 0 ? (
              neighborhoods.map((neighborhood) => (
                <DropdownMenuItem
                  key={neighborhood.id}
                  onClick={() => handleNeighborhoodSelect(neighborhood)}
                  className="cursor-pointer hover:bg-accent focus:bg-accent"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{neighborhood.name}</span>
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

        {isInDebugMode && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded text-amber-700 text-sm">
            <span className="font-medium">DEBUG MODE:</span>
            <span>Viewing {debugNeighborhood.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};