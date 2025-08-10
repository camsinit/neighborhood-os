
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
  onComplete
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
    // Show warning if trying to close with unsaved changes
    if (!open) {
      // TODO: Add confirmation dialog before closing
      // For now, just close the dialog
      onOpenChange(open);
    } else {
      onOpenChange(open);
    }
  };
  
  // Show welcome screen after survey completion
  if (showWelcomeScreen) {
    return (
      <Dialog open={open} onOpenChange={handleCloseRequest}>
        <DialogContent className="sm:max-w-[500px]">
          <WelcomeScreen onGetStarted={handleFinalComplete} />
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={handleCloseRequest}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[760px] max-h-[90vh] grid-rows-[auto_auto_1fr_auto]">
        {/* Survey header */}
        <SurveyStepHeader title={steps[currentStep].title} />
        
        {/* Progress indicator */}
        <SurveyProgress currentStep={currentStep} totalSteps={steps.length} />
        
        {/* Current step component - make this region scrollable so the footer stays visible */}
        <div className="py-2 overflow-y-auto min-h-0">
          <SurveyStepRenderer
            currentStep={currentStep}
            formData={formData}
            handleChange={handleChange}
            handleValidation={handleValidation}
          />
        </div>
        
        {/* Navigation buttons - always visible at the bottom of the dialog */}
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
