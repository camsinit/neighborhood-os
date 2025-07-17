import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SurveyStepHeader } from "./SurveyStepHeader";
import { SurveyProgress } from "./SurveyProgress";
import { SurveyStepRenderer } from "./SurveyStepRenderer";
import { SurveyNavigation } from "./SurveyNavigation";
import { useSurveyState } from "./hooks/useSurveyState";
import { WelcomeScreen } from "../WelcomeScreen";
import { useState, useEffect } from "react";
import { FormSubmissionState } from "./types/surveyTypes";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@supabase/auth-helpers-react";
import { extractOAuthUserData, isOAuthUser } from "@/utils/oauthDataExtraction";
import { CheckCircle } from "lucide-react";

/**
 * SurveyDialog component
 * 
 * A multi-step survey dialog that collects user information during onboarding.
 * Now OAuth-aware and adapts the flow based on authentication method.
 * Shows a welcome screen with confetti after completion.
 * 
 * UPDATED: OAuth-aware with dynamic step flow based on auth method
 */
interface SurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (formData: any) => void;
  isTestMode?: boolean;
  submissionState?: FormSubmissionState;
}

// Define the survey steps - now dynamic based on auth method
const getSteps = (authMethod: 'oauth' | 'manual') => {
  if (authMethod === 'oauth') {
    return [
      { title: "Welcome!" },
      { title: "About You" },
      { title: "Privacy Settings" },
    ];
  }
  return [
    { title: "Basic Information" },
    { title: "Contact & Account" },
    { title: "Address" },
    { title: "Profile Photo" },
  ];
};

const SurveyDialog = ({ 
  open, 
  onOpenChange, 
  onComplete,
  isTestMode = false,
  submissionState,
}: SurveyDialogProps) => {
  const user = useUser();
  
  // Track if survey is completed and showing welcome screen
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Use custom hook for survey state management
  const {
    currentStep,
    formData,
    handleChange,
    handleValidation,
    isCurrentStepValid,
    handleNext,
    handlePrevious,
    initializeFormData,
  } = useSurveyState();

  // Initialize with OAuth data if available
  useEffect(() => {
    if (user && !isInitialized) {
      if (isOAuthUser(user)) {
        console.log("[SurveyDialog] Initializing with OAuth data");
        const oauthData = extractOAuthUserData(user);
        initializeFormData(oauthData);
      }
      setIsInitialized(true);
    }
  }, [user, isInitialized, initializeFormData]);

  // Get dynamic steps based on auth method
  const steps = getSteps(formData.authMethod);
  
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
  
  // Show welcome screen after survey completion
  if (showWelcomeScreen) {
    return (
      <Dialog open={open} onOpenChange={handleCloseRequest}>
        <DialogContent className="sm:max-w-[500px]" hideCloseButton>
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
      <DialogContent className="sm:max-w-[500px]" hideCloseButton>
        {/* Test mode indicator */}
        {isTestMode && (
          <div className="bg-amber-50 border border-amber-200 rounded px-3 py-1 text-amber-700 text-sm mb-2">
            Test Mode - No changes will be saved to your profile
          </div>
        )}
        
        {/* OAuth indicator */}
        {formData.authMethod === 'oauth' && formData.isDataPrePopulated && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg mb-4">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Connected with Google - some information pre-filled</span>
          </div>
        )}
        
        {/* Submission progress overlay */}
        {submissionState?.isSubmitting && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50 rounded-lg">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Setting up your profile...</p>
                <Progress value={submissionState.progress} className="w-64" />
                <p className="text-xs text-gray-500">{submissionState.progress}% complete</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Survey header */}
        <SurveyStepHeader title={`${steps[currentStep].title}${testModeIndicator}`} />
        
        {/* Progress indicator */}
        <SurveyProgress 
          currentStep={currentStep} 
          totalSteps={steps.length}
        />
        
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
          disabled={submissionState?.isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SurveyDialog;
