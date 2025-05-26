import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SurveyStepHeader } from "./SurveyStepHeader";
import { SurveyProgress } from "./SurveyProgress";
import { SurveyStepRenderer } from "./SurveyStepRenderer";
import { SurveyNavigation } from "./SurveyNavigation";
import { useSurveyState } from "./hooks/useSurveyState";

/**
 * SurveyDialog component
 * 
 * A multi-step survey dialog that collects user information during onboarding.
 * Now refactored into smaller, focused components for better maintainability.
 */
interface SurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
  isTestMode?: boolean;
}

// Define the survey steps - updated to reflect the enhanced skills section
const steps = [
  {
    title: "Basic Information",
  },
  {
    title: "Contact Information",
  },
  {
    title: "Address",
  },
  {
    title: "Profile Photo",
  },
  {
    title: "Skills & Expertise", // Updated title to reflect enhanced capabilities
  },
];

const SurveyDialog = ({ 
  open, 
  onOpenChange, 
  onComplete,
  isTestMode = false
}: SurveyDialogProps) => {
  // Use custom hook for survey state management
  const {
    currentStep,
    formData,
    handleChange,
    handleValidation, // Get validation handler from hook
    isCurrentStepValid,
    handleNext,
    handlePrevious,
  } = useSurveyState();
  
  // Handle dialog close request
  const handleCloseRequest = (open: boolean) => {
    // If test mode, allow closing without warning
    if (isTestMode) {
      onOpenChange(open);
      return;
    }
    
    // In normal mode, show warning if trying to close
    if (!open) {
      // TODO: Add confirmation dialog before closing
      // For now, just close the dialog
      onOpenChange(open);
    } else {
      onOpenChange(open);
    }
  };
  
  // Get test mode indicator for the dialog title
  const testModeIndicator = isTestMode ? " (Test Mode)" : "";
  
  return (
    <Dialog open={open} onOpenChange={handleCloseRequest}>
      <DialogContent className="sm:max-w-[500px]">
        {/* Test mode indicator */}
        {isTestMode && (
          <div className="bg-amber-50 border border-amber-200 rounded px-3 py-1 text-amber-700 text-sm mb-2">
            Test Mode - No changes will be saved to your profile
          </div>
        )}
        
        {/* Survey header */}
        <SurveyStepHeader title={`${steps[currentStep].title}${testModeIndicator}`} />
        
        {/* Progress indicator */}
        <SurveyProgress currentStep={currentStep} totalSteps={steps.length} />
        
        {/* Current step component */}
        <div className="py-4">
          <SurveyStepRenderer
            currentStep={currentStep}
            formData={formData}
            handleChange={handleChange}
            handleValidation={handleValidation} // Pass validation handler
          />
        </div>
        
        {/* Navigation buttons */}
        <SurveyNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          isCurrentStepValid={isCurrentStepValid()}
          onPrevious={handlePrevious}
          onNext={() => handleNext(onComplete, steps.length)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SurveyDialog;
