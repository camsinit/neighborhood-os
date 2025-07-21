import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { SPECIAL_SKILLS } from '@/components/onboarding/survey/steps/skills/skillCategories';

/**
 * SkillList - Optimized list-based component for displaying and selecting skills
 * Designed specifically for side panel interfaces with single-column layout
 * Replaces the cramped grid layout with a clean, mobile-friendly list
 */
interface SkillListProps {
  skills: string[];
  selectedSkills: string[];
  onSkillSelect: (skillName: string) => void;
}

const SkillList: React.FC<SkillListProps> = ({
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
    const logPrefix = '🎯 [SkillList]';
    
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
    <div className="space-y-3">
      {/* List header with skills count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{skills.length} skills available</span>
        {selectedSkills.length > 0 && (
          <span className="text-skills font-medium">
            {selectedSkills.length} selected
          </span>
        )}
      </div>
      
      {/* Skills list - optimized for side panels */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {skills.map((skill) => {
          const selected = isSkillSelected(skill);
          const hasSpecialDetails = SPECIAL_SKILLS[skill as keyof typeof SPECIAL_SKILLS];
          
          return (
            <div
              key={skill}
              className={`group relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                selected 
                  ? 'bg-skills-light border-skills shadow-sm' 
                  : 'bg-card border-border hover:bg-muted/50 hover:border-muted-foreground/20'
              }`}
              onClick={() => handleSkillClick(skill)}
            >
              {/* Checkbox - visually appealing with skills theme */}
              <Checkbox
                checked={selected}
                onChange={() => {}} // Handled by parent div click
                className={`flex-shrink-0 ${selected ? 'border-skills bg-skills' : ''}`}
              />
              
              {/* Skill name - optimized typography for lists */}
              <div className="flex-1 min-w-0">
                <span className={`block text-sm font-medium truncate ${
                  selected 
                    ? 'text-skills' 
                    : 'text-card-foreground group-hover:text-foreground'
                }`}>
                  {skill}
                </span>
              </div>
              
              {/* Special skill indicator - compact design for lists */}
              {hasSpecialDetails && (
                <Badge 
                  variant="outline" 
                  className={`flex-shrink-0 text-xs px-2 py-0.5 ${
                    selected 
                      ? 'border-skills text-skills'
                      : 'border-muted-foreground/40 text-muted-foreground'
                  }`}
                >
                  Details
                </Badge>
              )}
              
              {/* Selection indicator - subtle animation */}
              {selected && (
                <div className="absolute -right-1 -top-1">
                  <div className="w-3 h-3 rounded-full animate-pulse bg-skills" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillList;