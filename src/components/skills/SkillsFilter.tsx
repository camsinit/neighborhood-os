
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { SkillCategory } from './types/skillTypes';
import { Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Props for the SkillsFilter component
 */
interface SkillsFilterProps {
  selectedCategory: SkillCategory | null;
  onCategoryChange: (category: SkillCategory | null) => void;
}

/**
 * Categories available for filtering skills
 */
const CATEGORIES: { label: string; value: SkillCategory; color: string; }[] = [
  { label: 'Creative', value: 'creative', color: 'bg-orange-100 text-orange-800 hover:bg-orange-200' },
  { label: 'Trade', value: 'trade', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' },
  { label: 'Technology', value: 'technology', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
  { label: 'Education', value: 'education', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
  { label: 'Wellness', value: 'wellness', color: 'bg-pink-100 text-pink-800 hover:bg-pink-200' },
];

/**
 * SkillsFilter - Filter component for the skills page
 * 
 * This component provides a dropdown to filter skills by category
 */
const SkillsFilter: React.FC<SkillsFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* Category filter dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex gap-2 items-center">
            <Filter className="h-4 w-4" />
            <span>Filter by Category</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white">
          <DropdownMenuItem 
            className="cursor-pointer font-medium" 
            onSelect={() => onCategoryChange(null)}
          >
            All Categories
          </DropdownMenuItem>
          {CATEGORIES.map((category) => (
            <DropdownMenuItem 
              key={category.value}
              className="cursor-pointer"
              onSelect={() => onCategoryChange(category.value)}
            >
              <div className="flex items-center justify-between w-full">
                <span>{category.label}</span>
                {selectedCategory === category.value && (
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Show selected category as badge */}
      {selectedCategory && (
        <Badge 
          className={`bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-1`}
        >
          {CATEGORIES.find(cat => cat.value === selectedCategory)?.label || selectedCategory}
          <Button 
            variant="ghost" 
            size="sm"
            className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
            onClick={() => onCategoryChange(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
    </div>
  );
};

export default SkillsFilter;
