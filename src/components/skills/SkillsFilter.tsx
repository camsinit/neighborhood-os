
/**
 * Enhanced SkillsFilter component
 * 
 * This component provides filtering controls for skills listings with:
 * - Category filtering
 * - Type filtering (offers/requests)
 * - Search functionality
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Filter, XCircle } from 'lucide-react';
import { SkillCategory } from '../skills/types/skillTypes';
import { cn } from '@/lib/utils';

// Define the props for the component
interface SkillsFilterProps {
  selectedCategory: SkillCategory | null;
  onCategoryChange: (category: SkillCategory | null) => void;
}

// Category configuration with colors and labels
const categoryConfig: Record<SkillCategory, { color: string, bgColor: string, label: string }> = {
  creative: { color: 'text-[#F97316]', bgColor: 'bg-[#FDE1D3]', label: 'Creative' },
  trade: { color: 'text-[#8B5CF6]', bgColor: 'bg-[#E5DEFF]', label: 'Trade' },
  technology: { color: 'text-[#221F26]', bgColor: 'bg-[#D3E4FD]', label: 'Technology' },
  education: { color: 'text-emerald-600', bgColor: 'bg-[#F2FCE2]', label: 'Education' },
  wellness: { color: 'text-[#D946EF]', bgColor: 'bg-[#FFDEE2]', label: 'Wellness' },
};

// Categories array for iteration
const categories: SkillCategory[] = [
  'creative',
  'trade',
  'technology',
  'education',
  'wellness'
];

const SkillsFilter: React.FC<SkillsFilterProps> = ({ 
  selectedCategory, 
  onCategoryChange 
}) => {
  // Handle category selection
  const handleCategoryClick = (category: SkillCategory) => {
    // If the category is already selected, clear it. Otherwise, select it.
    onCategoryChange(selectedCategory === category ? null : category);
  };

  // Clear all filters
  const handleClearFilters = () => {
    onCategoryChange(null);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Category filtering */}
      <div className="flex flex-wrap gap-2 items-center">
        {categories.map(category => {
          const isSelected = selectedCategory === category;
          const config = categoryConfig[category];
          
          return (
            <Badge
              key={category}
              className={cn(
                `${config.bgColor} ${config.color} cursor-pointer hover:opacity-90 border-0 transition-all`,
                isSelected && 'ring-2 ring-offset-1 ring-primary'
              )}
              onClick={() => handleCategoryClick(category)}
            >
              {config.label}
              {isSelected && <CheckCircle className="ml-1 h-3 w-3" />}
            </Badge>
          );
        })}
      </div>

      {/* Clear filters button - only show when filters are active */}
      {selectedCategory && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleClearFilters}
          className="text-gray-500 hover:text-gray-700 p-1 h-auto"
        >
          <XCircle className="h-4 w-4 mr-1" />
          <span>Clear</span>
        </Button>
      )}
    </div>
  );
};

export default SkillsFilter;
