
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

/**
 * SurveyNavigation component
 * 
 * Handles the navigation buttons (Back/Next/Complete) for the survey steps.
 * Includes validation logic to determine when navigation should be enabled.
 * Now includes special validation for skills step to ensure users complete the mini-survey.
 */
interface SurveyNavigationProps {
  currentStep: number;
  totalSteps: number;
  isCurrentStepValid: boolean;
  onPrevious: () => void;
  onNext: () => void;
  // New props for skills step validation
  isSkillsStep?: boolean;
  hasCompletedSkillsSurvey?: boolean;
  hasSelectedSkills?: boolean;
}

export const SurveyNavigation = ({
  currentStep,
  totalSteps,
  isCurrentStepValid,
  onPrevious,
  onNext,
  isSkillsStep = false,
  hasCompletedSkillsSurvey = false,
  hasSelectedSkills = false,
}: SurveyNavigationProps) => {
  
  // Determine if the next button should be disabled
  const isNextDisabled = () => {
    // For skills step, only require completion of mini-survey (skills selection is optional)
    if (isSkillsStep) {
      console.log('Skills step validation:', { hasCompletedSkillsSurvey, hasSelectedSkills });
      return !hasCompletedSkillsSurvey;
    }
    
    // For other steps that require validation (steps 0-2), use the existing validation
    if (currentStep < 3) {
      return !isCurrentStepValid;
    }
    
    // For steps that don't require validation, allow progression
    return false;
  };

  const buttonDisabled = isNextDisabled();
  console.log('Navigation button state:', { 
    currentStep, 
    isSkillsStep, 
    hasCompletedSkillsSurvey, 
    hasSelectedSkills, 
    buttonDisabled 
  });

  return (
    <div className="flex justify-between pt-2">
      {/* Back button - disabled on first step */}
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 0}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      {/* Next/Complete button - validation applies based on step requirements */}
      <Button
        onClick={onNext}
        disabled={buttonDisabled}
      >
        {currentStep < totalSteps - 1 ? (
          <>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        ) : (
          <>
            Complete
            <Check className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};
