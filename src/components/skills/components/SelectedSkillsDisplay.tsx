
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { SKILL_CATEGORIES } from '@/components/onboarding/survey/steps/skills/skillCategories';
import { SkillCategory } from '@/components/skills/types/skillTypes';

/**
 * SelectedSkillsDisplay - Component for showing selected skills with removal option
 * Displays skills as badges and allows users to remove them
 */
interface SelectedSkill {
  name: string;
  details?: string;
  category: SkillCategory;
}

interface SelectedSkillsDisplayProps {
  selectedSkills: SelectedSkill[];
  currentCategory?: SkillCategory | null;
  onRemoveSkill: (skillName: string, category: SkillCategory) => void;
  showMultiCategory?: boolean;
}

const SelectedSkillsDisplay: React.FC<SelectedSkillsDisplayProps> = ({
  selectedSkills,
  currentCategory,
  onRemoveSkill,
  showMultiCategory = false
}) => {
  // Filter skills for current category if specified
  const displaySkills = currentCategory 
    ? selectedSkills.filter(skill => skill.category === currentCategory)
    : selectedSkills;

  if (displaySkills.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="text-center">
        <Badge variant="secondary" className="text-xs px-2 py-1">
          {displaySkills.length} skills added {currentCategory ? 'from this category' : 'this session'}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {displaySkills.map((skill, index) => (
          <Badge key={index} variant={showMultiCategory ? "outline" : "secondary"} className="flex items-center gap-1 text-xs">
            <span className="truncate max-w-[120px]">
              {skill.details ? `${skill.name}: ${skill.details}` : skill.name}
            </span>
            {showMultiCategory && (
              <span className="text-xs text-muted-foreground">
                ({SKILL_CATEGORIES[skill.category]?.title})
              </span>
            )}
            <button
              onClick={() => onRemoveSkill(skill.name, skill.category)}
              className="ml-1 hover:bg-red-500 hover:text-white rounded-full p-0.5"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default SelectedSkillsDisplay;
