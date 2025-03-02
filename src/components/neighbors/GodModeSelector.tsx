
import { useState } from 'react';
import { useNeighborhood } from '@/contexts/neighborhood';
import { Button } from '@/components/ui/button';
import { SearchIcon, GlobeIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

/**
 * GodModeSelector Component
 * 
 * This component allows core contributors to switch between neighborhoods
 * It's only visible to users with the core contributor role who have 
 * the can_access_all_neighborhoods permission
 */
const GodModeSelector = () => {
  // Get neighborhood data from context
  const { 
    isCoreContributor, 
    allNeighborhoods, 
    currentNeighborhood,
    setCurrentNeighborhood 
  } = useNeighborhood();
  
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // If not a core contributor, don't render anything
  if (!isCoreContributor) {
    return null;
  }
  
  // Filter neighborhoods based on search query
  const filteredNeighborhoods = allNeighborhoods.filter(neighborhood => 
    neighborhood.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle neighborhood selection
  const handleSelectNeighborhood = (neighborhood: any) => {
    if (neighborhood.id === currentNeighborhood?.id) {
      return; // Already selected
    }
    
    // Set the new neighborhood
    setCurrentNeighborhood(neighborhood);
    
    // Show a toast notification
    toast({
      title: "Neighborhood Changed",
      description: `You are now viewing ${neighborhood.name}`,
    });
    
    // Close the dropdown
    setIsOpen(false);
  };
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
          title="God Mode - Access All Neighborhoods"
        >
          <GlobeIcon className="h-4 w-4 mr-2" />
          God Mode
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-72" 
        align="end"
      >
        <DropdownMenuLabel className="text-center bg-amber-50 text-amber-800">
          Core Contributor Access
        </DropdownMenuLabel>
        
        {/* Search Input */}
        <div className="px-2 py-2">
          <div className="relative">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search neighborhoods..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing
            />
          </div>
        </div>
        
        {/* List of neighborhoods */}
        <div className="max-h-[300px] overflow-y-auto">
          {filteredNeighborhoods.length === 0 ? (
            <div className="px-2 py-3 text-center text-sm text-muted-foreground">
              No neighborhoods found
            </div>
          ) : (
            filteredNeighborhoods.map((neighborhood) => (
              <DropdownMenuItem
                key={neighborhood.id}
                className={`cursor-pointer ${
                  currentNeighborhood?.id === neighborhood.id 
                    ? 'bg-amber-100 font-medium' 
                    : ''
                }`}
                onClick={() => handleSelectNeighborhood(neighborhood)}
              >
                {neighborhood.name}
                {currentNeighborhood?.id === neighborhood.id && (
                  <span className="ml-auto text-xs text-green-600">(Current)</span>
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
        
        <div className="p-2 text-xs text-center border-t text-muted-foreground">
          Total: {allNeighborhoods.length} neighborhoods
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default GodModeSelector;
