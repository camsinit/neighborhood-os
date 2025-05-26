
import { SkillsMiniSurvey } from "./skills/SkillsMiniSurvey";

/**
 * Enhanced Skills Selection Step Component
 * 
 * This component now uses a mini-survey approach where users progress
 * through each skill category one at a time, then set availability preferences,
 * with a summary at the end. It tracks completion state and selected skills 
 * for navigation validation.
 */
interface EnhancedSkillsStepProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  onSurveyStateChange?: (hasCompleted: boolean, hasSkills: boolean) => void;
  onMiniSurveyProgress?: (currentStep: number, totalSteps: number, hasCompleted: boolean) => void;
  onAvailabilityChange?: (availability: string, timePreferences: string[]) => void;
}

export const EnhancedSkillsStep = ({
  selectedSkills,
  onSkillsChange,
  onSurveyStateChange,
  onMiniSurveyProgress,
  onAvailabilityChange
}: EnhancedSkillsStepProps) => {
  return (
    <div className="space-y-6">
      {/* Introduction text */}
      <div className="text-center space-y-2">
        {/* This section was left intentionally minimal based on the original file */}
      </div>

      {/* Mini-survey component with availability handling */}
      <SkillsMiniSurvey 
        selectedSkills={selectedSkills} 
        onSkillsChange={onSkillsChange} 
        onSurveyStateChange={onSurveyStateChange}
        onMiniSurveyProgress={onMiniSurveyProgress}
        onAvailabilityChange={onAvailabilityChange}
      />
    </div>
  );
};
