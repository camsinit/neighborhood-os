
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

/**
 * SurveyNavigation component
 * 
 * Handles the navigation buttons (Back/Next/Complete) for the survey steps.
 * Includes validation logic to determine when navigation should be enabled.
 */
interface SurveyNavigationProps {
  currentStep: number;
  totalSteps: number;
  isCurrentStepValid: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const SurveyNavigation = ({
  currentStep,
  totalSteps,
  isCurrentStepValid,
  onPrevious,
  onNext,
}: SurveyNavigationProps) => {
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
      
      {/* Next/Complete button - validation applies only to certain steps */}
      <Button
        onClick={onNext}
        disabled={!isCurrentStepValid && currentStep < 3}
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
