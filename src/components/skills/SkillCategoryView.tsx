
import React from 'react';
import { SkillCategory } from './types/skillTypes';
import SimplifiedSkillsList from './SimplifiedSkillsList';

/**
 * Component that displays all skills within a specific category
 * The header (back button and title) has been moved to be positioned with the "Add Skill" button
 */

interface SkillCategoryViewProps {
  category: SkillCategory;
  onBack: () => void;
}

const SkillCategoryView: React.FC<SkillCategoryViewProps> = ({ category, onBack }) => {
  return (
    <div className="space-y-4">
      {/* Skills list filtered by category - header moved to parent component */}
      <SimplifiedSkillsList
        showRequests={false}
        selectedCategory={category}
        searchQuery=""
      />
    </div>
  );
};

export default SkillCategoryView;
