
/**
 * SkillsFilter component (placeholder)
 * Filter controls for skills listings
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

const SkillsFilter: React.FC = () => {
  return (
    <Button variant="outline" size="sm" className="flex items-center gap-1.5">
      <Filter className="h-4 w-4" />
      <span>Filter</span>
    </Button>
  );
};

export default SkillsFilter;
