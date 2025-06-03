
import React from 'react';
import SimplifiedSkillsList from './SimplifiedSkillsList';
import { SkillCategory } from './types/skillTypes';

/**
 * Updated SkillsList component that now uses the simplified approach
 * This maintains the same interface but uses the new simplified backend
 */
interface SkillsListProps {
  showRequests?: boolean;
  showMine?: boolean;
  selectedCategory?: SkillCategory;
  searchQuery?: string;
}

const SkillsList: React.FC<SkillsListProps> = ({
  showRequests = false,
  showMine = false,
  selectedCategory,
  searchQuery = ''
}) => {
  return (
    <SimplifiedSkillsList
      showRequests={showRequests}
      showMine={showMine}
      selectedCategory={selectedCategory}
      searchQuery={searchQuery}
    />
  );
};

export default SkillsList;
