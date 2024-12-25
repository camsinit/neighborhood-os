import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Calendar, Shield, HandHelping } from "lucide-react";
import OnboardingStep from "./steps/OnboardingStep";
import OnboardingProgress from "./navigation/OnboardingProgress";
import OnboardingNavigation from "./navigation/OnboardingNavigation";

const steps = [
  {
    title: "Welcome to Terrific Terrace",
    description: "Your community hub for mutual support, safety updates, and events.",
    icon: Check,
  },
  {
    title: "Community Calendar",
    description: "Stay updated with local events and activities. Create or join events to connect with your neighbors.",
    icon: Calendar,
  },
  {
    title: "Safety Updates",
    description: "Get real-time safety information and updates from your community members.",
    icon: Shield,
  },
  {
    title: "Mutual Support",
    description: "Share resources, skills, and help with your neighbors. Request or offer support when needed.",
    icon: HandHelping,
  },
];

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OnboardingDialog = ({ open, onOpenChange }: OnboardingDialogProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onOpenChange(false);
      navigate("/");
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      navigate("/login");
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

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