
import React from 'react';
import { SkillCategory } from './types/skillTypes';
import { useSkillsPreview } from '@/hooks/skills/useSkillsPreview';
import SkillCategoryCard from './SkillCategoryCard';
import { Loader2 } from 'lucide-react';

/**
 * Grid component that displays all skill categories with previews of available skills
 * Uses a responsive grid layout and handles loading states
 */

interface SkillCategoryGridProps {
  onCategoryClick: (category: SkillCategory) => void;
}

const SkillCategoryGrid: React.FC<SkillCategoryGridProps> = ({ onCategoryClick }) => {
  const { data: skillsData, isLoading, error } = useSkillsPreview();

  // All available skill categories
  const categories: SkillCategory[] = ['technology', 'creative', 'trade', 'education', 'wellness'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading skill categories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Error loading skill categories. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <SkillCategoryCard
          key={category}
          category={category}
          skillsData={skillsData?.[category] || { offers: [], requests: [] }}
          onClick={onCategoryClick}
        />
      ))}
    </div>
  );
};

export default SkillCategoryGrid;
