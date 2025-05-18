
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";

interface SurveyNavigationProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
}

/**
 * SurveyNavigation component
 * 
 * This component renders the navigation buttons for moving between steps
 * in the survey, with enhanced visual styling and animations
 */
export const SurveyNavigation = ({
  currentStep,
  totalSteps,
  isSubmitting,
  onBack,
  onNext,
}: SurveyNavigationProps) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex justify-between items-center pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        className={`transition-all duration-300 ${
          isFirstStep ? 'opacity-0 pointer-events-none' : 'bg-white/70 hover:bg-white'
        }`}
        disabled={isSubmitting}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Button
        type="button"
        onClick={onNext}
        className="transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-md hover:shadow-lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : isLastStep ? (
          <>
            Complete
            <Check className="ml-2 h-4 w-4" />
          </>
        ) : (
          <>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};
