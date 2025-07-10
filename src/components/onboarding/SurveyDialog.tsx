
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SurveyStepHeader } from "./survey/SurveyStepHeader";
import { SurveyProgress } from "./survey/SurveyProgress";
import { SurveyStepRenderer } from "./survey/SurveyStepRenderer";
import { SurveyNavigation } from "./survey/SurveyNavigation";
import { useSurveyState } from "./survey/hooks/useSurveyState";
import { WelcomeScreen } from "./WelcomeScreen";
import { useState } from "react";

/**
 * SurveyDialog component
 * 
 * A multi-step survey dialog that collects user information during onboarding.
 * Now refactored into smaller, focused components for better maintainability.
 * Includes skills survey validation to ensure users complete the mini-survey.
 * Shows a welcome screen with confetti after completion.
 */
interface SurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
  isTestMode?: boolean;
}

// Define the survey steps (skills step removed - moved to Skills page)
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
];

const SurveyDialog = ({ 
  open, 
  onOpenChange, 
  onComplete,
  isTestMode = false
}: SurveyDialogProps) => {
  // Track if survey is completed and showing welcome screen
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  
  // Use custom hook for survey state management
  const {
    currentStep,
    formData,
    skillsSurveyState,
    handleChange,
    handleValidation,
    handleSkillsSurveyStateChange,
    isCurrentStepValid,
    handleNext,
    handlePrevious,
  } = useSurveyState();
  
  // Handle survey completion - show welcome screen first
  const handleSurveyComplete = () => {
    setShowWelcomeScreen(true);
  };
  
  // Handle final completion when user clicks "Get Started" from welcome screen
  const handleFinalComplete = () => {
    onComplete?.();
  };
  
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
  
  // Show welcome screen after survey completion
  if (showWelcomeScreen) {
    return (
      <Dialog open={open} onOpenChange={handleCloseRequest}>
        <DialogContent className="sm:max-w-[500px]">
          {/* Test mode indicator */}
          {isTestMode && (
            <div className="bg-amber-50 border border-amber-200 rounded px-3 py-1 text-amber-700 text-sm mb-2">
              Test Mode - No changes will be saved to your profile
            </div>
          )}
          
          <WelcomeScreen onGetStarted={handleFinalComplete} />
        </DialogContent>
      </Dialog>
    );
  }
  
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
          handleValidation={handleValidation}
        />
        </div>
        
        {/* Navigation buttons */}
        <SurveyNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          isCurrentStepValid={isCurrentStepValid()}
          onPrevious={handlePrevious}
          onNext={() => handleNext(handleSurveyComplete, steps.length)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SurveyDialog;
