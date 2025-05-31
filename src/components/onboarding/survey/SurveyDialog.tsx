
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SurveyStepHeader } from "./SurveyStepHeader";
import { SurveyProgress } from "./SurveyProgress";
import { SurveyStepRenderer } from "./SurveyStepRenderer";
import { SurveyNavigation } from "./SurveyNavigation";
import { useSurveyState } from "./hooks/useSurveyState";
import { WelcomeScreen } from "../WelcomeScreen";
import { useState } from "react";
import { FormSubmissionState } from "./types/surveyTypes";
import { Progress } from "@/components/ui/progress";

/**
 * SurveyDialog component
 * 
 * A multi-step survey dialog that collects user information during onboarding.
 * Now refactored into smaller, focused components for better maintainability.
 * Includes skills survey validation to ensure users complete the mini-survey.
 * Shows a welcome screen with confetti after completion.
 * Now includes form submission progress tracking.
 * 
 * UPDATED: Now supports guest onboarding mode
 */
interface SurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (formData: any) => void;
  isTestMode?: boolean;
  submissionState?: FormSubmissionState;
  isGuestMode?: boolean;
}

// Define the survey steps
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
    title: "Skills & Interests",
  },
];

const SurveyDialog = ({ 
  open, 
  onOpenChange, 
  onComplete,
  isTestMode = false,
  submissionState,
  isGuestMode = false
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
  
  // Track skills mini-survey progress for progress bar calculation
  const [skillsMiniSurveyProgress, setSkillsMiniSurveyProgress] = useState({
    currentStep: 0,
    totalSteps: 7, // 6 categories + 1 availability + 1 summary
    hasCompleted: false,
  });
  
  // Handle skills mini-survey progress updates
  const handleSkillsMiniSurveyProgress = (currentStep: number, totalSteps: number, hasCompleted: boolean) => {
    setSkillsMiniSurveyProgress({
      currentStep,
      totalSteps,
      hasCompleted,
    });
  };
  
  // Handle survey completion - pass form data to completion handler
  const handleSurveyComplete = () => {
    // Pass form data to completion handler immediately
    onComplete?.(formData);
    setShowWelcomeScreen(true);
  };
  
  // Handle final completion when user clicks "Get Started" from welcome screen
  const handleFinalComplete = () => {
    // This is called after the welcome screen, form data was already submitted
    setShowWelcomeScreen(false);
    onOpenChange(false);
  };
  
  // Handle dialog close request
  const handleCloseRequest = (open: boolean) => {
    // If test mode, allow closing without warning
    if (isTestMode) {
      onOpenChange(open);
      return;
    }
    
    // Don't allow closing during submission
    if (submissionState?.isSubmitting) {
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
  const guestModeIndicator = isGuestMode ? " - Create Account" : "";
  
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
        
        {/* Guest mode indicator */}
        {isGuestMode && !isTestMode && (
          <div className="bg-blue-50 border border-blue-200 rounded px-3 py-1 text-blue-700 text-sm mb-2">
            Creating your account and joining the neighborhood
          </div>
        )}
        
        {/* Submission progress overlay */}
        {submissionState?.isSubmitting && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50 rounded-lg">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {isGuestMode ? "Creating your account..." : "Setting up your profile..."}
                </p>
                <Progress value={submissionState.progress} className="w-64" />
                <p className="text-xs text-gray-500">{submissionState.progress}% complete</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Survey header */}
        <SurveyStepHeader title={`${steps[currentStep].title}${testModeIndicator}${guestModeIndicator}`} />
        
        {/* Progress indicator - now includes skills mini-survey progress */}
        <SurveyProgress 
          currentStep={currentStep} 
          totalSteps={steps.length}
          skillsSurveyProgress={currentStep === 4 ? skillsMiniSurveyProgress : undefined}
        />
        
        {/* Current step component */}
        <div className="py-4">
          <SurveyStepRenderer
            currentStep={currentStep}
            formData={formData}
            handleChange={handleChange}
            handleValidation={handleValidation}
            onSkillsSurveyStateChange={handleSkillsSurveyStateChange}
            onSkillsMiniSurveyProgress={handleSkillsMiniSurveyProgress}
            isGuestMode={isGuestMode}
          />
        </div>
        
        {/* Navigation buttons */}
        <SurveyNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          isCurrentStepValid={isCurrentStepValid()}
          onPrevious={handlePrevious}
          onNext={() => handleNext(handleSurveyComplete, steps.length)}
          isSkillsStep={currentStep === 4}
          hasCompletedSkillsSurvey={skillsSurveyState.hasCompletedSurvey}
          hasSelectedSkills={skillsSurveyState.hasSelectedSkills}
          disabled={submissionState?.isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SurveyDialog;
