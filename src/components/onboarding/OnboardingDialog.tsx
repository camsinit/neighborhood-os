import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Calendar, Shield, HandHelping } from "lucide-react";
import OnboardingStep from "./steps/OnboardingStep";
import OnboardingProgress from "./navigation/OnboardingProgress";
import OnboardingNavigation from "./navigation/OnboardingNavigation";
import SurveyDialog from "./SurveyDialog";

const steps = [
  {
    title: "Welcome to Terrific Terrace",
    description: "We're excited to have you join our community! Together, we'll create a stronger, more connected neighborhood where everyone can thrive and support each other.",
    icon: Check,
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

const OnboardingDialog = ({ open, onOpenChange }: OnboardingDialogProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSurvey, setShowSurvey] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onOpenChange(false);
      setShowSurvey(true);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      navigate("/login");
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  if (showSurvey) {
    return <SurveyDialog open={true} onOpenChange={(open) => {
      setShowSurvey(open);
      if (!open) navigate("/");
    }} />;
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-100 via-pink-100 to-orange-100">
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <OnboardingStep
            icon={steps[currentStep].icon}
            title={steps[currentStep].title}
            description={steps[currentStep].description}
          />
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