import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Calendar, Shield, HandHelping } from "lucide-react";

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
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!open) return null;

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-100 via-pink-100 to-orange-100">
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CurrentIcon className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-center text-xl font-semibold">
              {steps[currentStep].title}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {steps[currentStep].description}
            </p>
          </div>
          <div className="flex justify-center space-x-1 pt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-12 rounded-full ${
                  index === currentStep ? "bg-primary" : "bg-primary/20"
                }`}
              />
            ))}
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
            </Button>
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Back
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingDialog;