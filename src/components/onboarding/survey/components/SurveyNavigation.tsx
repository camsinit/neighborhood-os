
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";

/**
 * SurveyNavigation component
 * 
 * Renders navigation buttons for the survey dialog
 * - Uses a consistent style for the Continue button to match the Next buttons elsewhere
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
      {/* Back button */}
      <Button
        variant="outline"
        onClick={onBack}
        disabled={isSubmitting}
      >
        {currentStep === 0 ? "Cancel" : "Back"}
      </Button>
      
      {/* Continue button - Updated to match the style of the Next button */}
      <Button 
        onClick={onNext}
        disabled={isSubmitting}
        variant="light" // Using the light variant to match the Next button style
        className="flex items-center text-center"
        size="sm" // Adding size to match the Next button
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Saving...
          </>
        ) : currentStep === totalSteps - 1 ? (
          <>
            Complete
            <ArrowRight className="h-4 w-4 ml-1" />
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="h-4 w-4 ml-1" />
          </>
        )}
      </Button>
    </div>
  );
};
