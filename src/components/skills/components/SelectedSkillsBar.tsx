import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';
import { SkillCategory } from '@/components/skills/types/skillTypes';

/**
 * SelectedSkillsBar - Persistent bottom bar showing selected skills
 * Provides quick access to selected skills count and finish action
 * Designed to be sticky at bottom of side panel for better UX
 */
interface SelectedSkill {
  name: string;
  details?: string;
  category: SkillCategory;
}

interface SelectedSkillsBarProps {
  selectedSkills: SelectedSkill[];
  onRemoveSkill: (skillName: string, category: SkillCategory) => void;
  onFinish?: () => void;
  isVisible: boolean;
}

const SelectedSkillsBar: React.FC<SelectedSkillsBarProps> = ({
  selectedSkills,
  onRemoveSkill,
  onFinish,
  isVisible
}) => {
  if (!isVisible || selectedSkills.length === 0) return null;

  return (
    <div 
      className="bg-background border-t border-border p-4 space-y-3"
      style={{ boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)' }}
    >
      {/* Skills count and action button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full animate-pulse bg-skills" />
          <span className="text-sm font-medium text-foreground">
            {selectedSkills.length} skills selected
          </span>
        </div>
        
        {onFinish && (
          <Button
            onClick={onFinish}
            className="bg-skills hover:bg-skills/90 text-white"
            size="sm"
          >
            <Check className="h-4 w-4 mr-1" />
            Finish
          </Button>
        )}
      </div>
      
      {/* Selected skills preview - scrollable if many skills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {selectedSkills.slice(0, 6).map((skill, index) => (
          <Badge 
            key={`${skill.category}-${skill.name}-${index}`}
            variant="secondary"
            className="flex items-center gap-1 text-xs whitespace-nowrap flex-shrink-0"
          >
            <span className="max-w-[100px] truncate">
              {skill.details ? `${skill.name}: ${skill.details}` : skill.name}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveSkill(skill.name, skill.category);
              }}
              className="hover:bg-red-500 hover:text-white rounded-full p-0.5 transition-colors"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </Badge>
        ))}
        
        {/* Show "and more" if there are additional skills */}
        {selectedSkills.length > 6 && (
          <Badge variant="outline" className="text-xs whitespace-nowrap flex-shrink-0">
            +{selectedSkills.length - 6} more
          </Badge>
        )}
      </div>
    </div>
  );
};

export default SelectedSkillsBar;