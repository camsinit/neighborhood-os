
/**
 * NeighborhoodSwitcher Component
 * 
 * This component allows users to switch between neighborhoods.
 * It displays a dropdown of available neighborhoods and allows switching
 * between them.
 */
import { useState } from 'react';
import { Check, ChevronDown, Building2 } from 'lucide-react'; 
import { useNeighborhood } from '@/hooks/useNeighborhood';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * NeighborhoodSwitcher component
 * 
 * Allows users to switch between available neighborhoods.
 * Only appears if the user has access to multiple neighborhoods.
 */
export default function NeighborhoodSwitcher() {
  const { 
    neighborhood, 
    availableNeighborhoods,
    setCurrentNeighborhood 
  } = useNeighborhood();
  
  const [isOpen, setIsOpen] = useState(false);
  
  // If user has no neighborhoods, don't render
  if (availableNeighborhoods.length === 0) {
    return null;
  }
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span className="max-w-[150px] truncate">
            {neighborhood?.name || 'Select Neighborhood'}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {availableNeighborhoods.map((n) => (
          <DropdownMenuItem
            key={n.id}
            onClick={() => {
              setCurrentNeighborhood(n);
              setIsOpen(false);
            }}
            className="flex items-center justify-between"
          >
            <span className="truncate">{n.name}</span>
            {neighborhood?.id === n.id && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
