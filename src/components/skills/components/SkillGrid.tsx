
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { SPECIAL_SKILLS } from '@/components/onboarding/survey/steps/skills/skillCategories';

/**
 * SkillGrid - Component for displaying and selecting skills in a grid layout
 * Handles skill selection with checkboxes and special skill indicators
 */
interface SkillGridProps {
  skills: string[];
  selectedSkills: string[];
  onSkillSelect: (skillName: string) => void;
}

const SkillGrid: React.FC<SkillGridProps> = ({
  skills,
  selectedSkills,
  onSkillSelect
}) => {
  const isSkillSelected = (skillName: string) => {
    return selectedSkills.includes(skillName);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
      {skills.map((skill) => {
        const selected = isSkillSelected(skill);
        return (
          <div
            key={skill}
            className={`p-3 border rounded-md cursor-pointer transition-colors hover:bg-gray-50 ${
              selected ? 'border-green-500 bg-green-50' : 'border-gray-200'
            }`}
            onClick={() => onSkillSelect(skill)}
          >
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selected}
                onChange={() => {}} // Handled by parent div click
              />
              <span className="text-sm font-medium truncate">{skill}</span>
              {SPECIAL_SKILLS[skill as keyof typeof SPECIAL_SKILLS] && (
                <Badge variant="outline" className="text-xs px-1 py-0">Details</Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SkillGrid;
