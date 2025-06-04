
import { SkillsMiniSurvey } from "./skills/SkillsMiniSurvey";

/**
 * Enhanced Skills Step Component (Simplified - No Availability)
 * 
 * This component renders the skills selection step in the onboarding survey.
 * It uses the SkillsMiniSurvey component to provide a comprehensive skills selection experience.
 * 
 * UPDATED: Removed availability and time preferences - onboarding now only collects skills.
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
    <div className="space-y-4">
      {/* Introduction text */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Skills & Interests</h3>
        <p className="text-sm text-muted-foreground">
          Let your neighbors know what skills you have to offer. You can always add more later.
        </p>
      </div>

      {/* Skills mini-survey component */}
      <SkillsMiniSurvey
        selectedSkills={selectedSkills}
        onSkillsChange={onSkillsChange}
        onSurveyStateChange={onSurveyStateChange}
        onMiniSurveyProgress={onMiniSurveyProgress}
      />
    </div>
  );
};
