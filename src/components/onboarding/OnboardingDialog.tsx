
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Calendar, Shield, HandHelping } from "lucide-react";
import OnboardingStep from "./steps/OnboardingStep";
import OnboardingProgress from "./navigation/OnboardingProgress";
import OnboardingNavigation from "./navigation/OnboardingNavigation";
import SurveyDialog from "./SurveyDialog";
import WelcomeScreen from "./WelcomeScreen";

// Define the steps for the onboarding process
const steps = [
  {
    // First step is now our welcome screen with neighbor carousel
    title: "Welcome",
    description: "Join your neighbors in creating a connected community where everyone can thrive and support each other.",
    component: WelcomeScreen,
  },
  {
    title: "Community Calendar",
    description: "Never miss out on neighborhood events! From block parties to community meetings, stay connected with what's happening around you. You can even host your own events!",
    icon: Calendar,
  },
  {
    title: "Safety Updates",
    description: "Your safety matters to us. Get real-time updates about important neighborhood safety information and contribute to keeping our community secure and informed.",
    icon: Shield,
  },
  {
    title: "Mutual Support",
    description: "We believe in the power of community helping community. Share your skills, request assistance, or offer support to neighbors in need. Together, we're stronger!",
    icon: HandHelping,
  },
];

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * OnboardingDialog component
 * 
 * This component guides new users through a series of screens that introduce
 * the main features of the neighborhood platform. It includes:
 * - Welcome screen with neighbor carousel
 * - Feature introduction screens
 * - Navigation to progress through steps
 * - Transition to the survey dialog for profile completion
 */
const OnboardingDialog = ({ open, onOpenChange }: OnboardingDialogProps) => {
  // Track the current step in the onboarding process
  const [currentStep, setCurrentStep] = useState(0);
  // Control whether to show the survey dialog after onboarding
  const [showSurvey, setShowSurvey] = useState(false);
  const navigate = useNavigate();

  // Handle progressing to the next step
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Move to the next onboarding step
      setCurrentStep(currentStep + 1);
    } else {
      // Completed all onboarding steps, show survey
      onOpenChange(false);
      setShowSurvey(true);
    }
  };

  // Handle going back to the previous step
  const handleBack = () => {
    if (currentStep === 0) {
      // At first step, go back to login
      navigate("/login");
    } else {
      // Go to previous step
      setCurrentStep(currentStep - 1);
    }
  };

  // If survey should be shown, render the survey dialog
  if (showSurvey) {
    return <SurveyDialog open={true} onOpenChange={(open) => {
      setShowSurvey(open);
      if (!open) navigate("/");
    }} />;
  }

  // Don't render anything if dialog is closed
  if (!open) return null;

  // Get the current step definition
  const currentStepData = steps[currentStep];
  
  // Determine if we should show the component or icon-based step
  const isWelcomeStep = currentStep === 0;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-100 via-pink-100 to-orange-100">
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white/70 backdrop-blur-sm p-8 rounded-lg shadow-lg">
          {isWelcomeStep ? (
            // Render the welcome screen component
            <currentStepData.component />
          ) : (
            // Render regular onboarding step with icon
            <OnboardingStep
              icon={currentStepData.icon}
              title={currentStepData.title}
              description={currentStepData.description}
            />
          )}
          
          <OnboardingProgress
            currentStep={currentStep}
            totalSteps={steps.length}
          />
          
          <OnboardingNavigation
            currentStep={currentStep}
            isLastStep={currentStep === steps.length - 1}
            onNext={handleNext}
            onBack={handleBack}
          />
        </div>
      </div>
    </div>
  );
};

export default OnboardingDialog;
