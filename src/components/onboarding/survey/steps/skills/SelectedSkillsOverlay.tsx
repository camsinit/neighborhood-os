
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, X } from "lucide-react";

/**
 * SelectedSkillsOverlay Component
 * 
 * A collapsible overlay that shows selected skills without taking up permanent space.
 * Expands as an overlay on top of the existing UI without pushing content down.
 */

interface SelectedSkill {
  name: string;
  details?: string;
}

interface SelectedSkillsOverlayProps {
  selectedSkills: SelectedSkill[];
  onRemoveSkill: (skillName: string) => void;
}

export const SelectedSkillsOverlay = ({ 
  selectedSkills, 
  onRemoveSkill 
}: SelectedSkillsOverlayProps) => {
  // State to control whether the overlay is expanded
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't render if no skills are selected
  if (selectedSkills.length === 0) {
    return null;
  }

  return (
    <div className="relative z-10">
      {/* Collapsible header bar - always visible when skills are selected */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
        >
          <span>
            {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Expanded overlay - positioned absolutely to not push content down */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20">
          <div className="max-h-40 overflow-y-auto">
            <div className="grid grid-cols-1 gap-2">
              {selectedSkills.map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="flex items-center justify-between gap-2 text-xs p-2"
                >
                  <span className="truncate text-xs flex-1">
                    {skill.details ? `${skill.name}: ${skill.details}` : skill.name}
                  </span>
                  <button
                    onClick={() => onRemoveSkill(skill.name)}
                    className="ml-1 hover:bg-red-500 hover:text-white rounded-full p-0.5 flex-shrink-0 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
