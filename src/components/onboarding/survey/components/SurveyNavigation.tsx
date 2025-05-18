
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

/**
 * SurveyNavigation component
 * 
 * Renders navigation buttons for the survey dialog
 */
interface SurveyNavigationProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
}

export const SurveyNavigation = ({
  currentStep,
  totalSteps,
  isSubmitting,
  onBack,
  onNext,
}: SurveyNavigationProps) => {
  return (
    <div className="flex justify-between mt-6">
      <Button
        variant="outline"
        onClick={onBack}
        disabled={isSubmitting}
      >
        {currentStep === 0 ? "Cancel" : "Back"}
      </Button>
      
      <Button 
        onClick={onNext}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Saving...
          </>
        ) : currentStep === totalSteps - 1 ? (
          "Complete"
        ) : (
          "Continue"
        )}
      </Button>
    </div>
  );
};
