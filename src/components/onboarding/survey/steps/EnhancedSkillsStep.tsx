
import { SkillsMiniSurvey } from "./skills/SkillsMiniSurvey";

/**
 * Enhanced Skills Selection Step Component
 * 
 * This component now uses a mini-survey approach where users progress
 * through each skill category one at a time, with a summary at the end.
 * It tracks completion state and selected skills for navigation validation.
 */
interface EnhancedSkillsStepProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  onSurveyStateChange?: (hasCompleted: boolean, hasSkills: boolean) => void;
  onMiniSurveyProgress?: (currentStep: number, totalSteps: number, hasCompleted: boolean) => void;
}

export const EnhancedSkillsStep = ({
  selectedSkills,
  onSkillsChange,
  onSurveyStateChange,
  onMiniSurveyProgress
}: EnhancedSkillsStepProps) => {
  return (
    <div className="space-y-6">
      {/* Introduction text */}
      <div className="text-center space-y-2">
        
        
      </div>

      {/* Mini-survey component */}
      <SkillsMiniSurvey 
        selectedSkills={selectedSkills} 
        onSkillsChange={onSkillsChange} 
        onSurveyStateChange={onSurveyStateChange}
        onMiniSurveyProgress={onMiniSurveyProgress}
      />
    </div>
  );
};
