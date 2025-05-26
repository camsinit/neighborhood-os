
import { SkillsMiniSurvey } from "./skills/SkillsMiniSurvey";

/**
 * Enhanced Skills Selection Step Component
 * 
 * This component now uses a mini-survey approach where users progress
 * through each skill category one at a time, with a summary at the end.
 */
interface EnhancedSkillsStepProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
}

export const EnhancedSkillsStep = ({ selectedSkills, onSkillsChange }: EnhancedSkillsStepProps) => {
  return (
    <div className="space-y-6">
      {/* Introduction text */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Share your skills and expertise with your neighborhood community.
        </p>
        <p className="text-xs text-muted-foreground">
          We'll guide you through each category. You can skip any that don't apply to you.
        </p>
      </div>

      {/* Mini-survey component */}
      <SkillsMiniSurvey 
        selectedSkills={selectedSkills}
        onSkillsChange={onSkillsChange}
      />
    </div>
  );
};
