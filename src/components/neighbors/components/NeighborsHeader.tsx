
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

/**
 * Props for the NeighborsHeader component
 */
interface NeighborsHeaderProps {
  onSearchChange: (query: string) => void;
  totalCount: number;
}

/**
 * NeighborsHeader Component
 * 
 * Header component for the neighbors page that includes a search bar
 * and displays the total count of neighbors found
 */
export const NeighborsHeader: React.FC<NeighborsHeaderProps> = ({
  onSearchChange,
  totalCount
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearchChange(query);
  };

  return (
    <div className="mb-6">
      {/* Search section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search neighbors by name, email, or bio..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>
        
        {/* Results count */}
        <div className="text-sm text-gray-600">
          {totalCount} {totalCount === 1 ? 'neighbor' : 'neighbors'}
        </div>
      </div>
    </div>
  );
};
