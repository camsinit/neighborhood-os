
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { SPECIAL_SKILLS } from '@/components/onboarding/survey/steps/skills/skillCategories';

/**
 * SkillGrid - Component for displaying and selecting skills in a grid layout
 * Handles skill selection with checkboxes and special skill indicators
 * ENHANCED: Improved event handling and error reporting for skill selection
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

  /**
   * Handle skill click with comprehensive debugging and error handling
   */
  const handleSkillClick = async (skillName: string) => {
    const logPrefix = '🎯 [SkillGrid]';
    
    console.log(`${logPrefix} Skill clicked:`, {
      skillName,
      isSelected: isSkillSelected(skillName),
      hasOnSkillSelect: !!onSkillSelect,
      onSkillSelectType: typeof onSkillSelect,
      timestamp: new Date().toISOString()
    });

    // Ensure we have the handler before calling it
    if (!onSkillSelect) {
      console.error(`❌ ${logPrefix} onSkillSelect handler is missing!`);
      return;
    }

    if (typeof onSkillSelect !== 'function') {
      console.error(`❌ ${logPrefix} onSkillSelect is not a function:`, typeof onSkillSelect);
      return;
    }

    try {
      console.log(`📞 ${logPrefix} Calling onSkillSelect handler for:`, skillName);
      
      // Call the handler and wait for it to complete
      const result = await onSkillSelect(skillName);
      
      console.log(`✅ ${logPrefix} onSkillSelect completed for ${skillName}:`, result);
    } catch (error) {
      console.error(`❌ ${logPrefix} Error in onSkillSelect for ${skillName}:`, {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        skillName,
        timestamp: new Date().toISOString()
      });
    }
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
            onClick={() => handleSkillClick(skill)}
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
