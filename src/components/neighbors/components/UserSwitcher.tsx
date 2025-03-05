
import { useEffect, useState } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNeighborhood } from "@/contexts/NeighborhoodContext";

interface Neighborhood {
  id: string;
  name: string;
}

/**
 * UserSwitcher component
 * 
 * Allows users to switch between neighborhoods they are members of
 */
export function UserSwitcher() {
  const { currentNeighborhood, allNeighborhoods, setCurrentNeighborhood } = useNeighborhood();
  const [open, setOpen] = useState(false);

  // Default to showing the current neighborhood name
  const displayName = currentNeighborhood?.name || "Select a neighborhood";

  // Handle neighborhood selection
  const handleSelect = (neighborhoodId: string) => {
    const selected = allNeighborhoods.find(n => n.id === neighborhoodId);
    if (selected) {
      setCurrentNeighborhood(selected);
    }
    setOpen(false);
  };

  // If there's only one neighborhood, auto-select it
  useEffect(() => {
    if (allNeighborhoods.length === 1 && !currentNeighborhood) {
      setCurrentNeighborhood(allNeighborhoods[0]);
    }
  }, [allNeighborhoods, currentNeighborhood, setCurrentNeighborhood]);

  // If there are no neighborhoods, don't render the switcher
  if (allNeighborhoods.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {displayName}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search neighborhood..." />
          <CommandEmpty>No neighborhood found.</CommandEmpty>
          <CommandGroup>
            {allNeighborhoods.map((neighborhood) => (
              <CommandItem
                key={neighborhood.id}
                value={neighborhood.id}
                onSelect={handleSelect}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentNeighborhood?.id === neighborhood.id
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {neighborhood.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
