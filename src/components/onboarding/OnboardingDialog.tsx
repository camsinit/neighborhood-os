import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

  const CurrentIcon = steps[currentStep].icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CurrentIcon className="h-6 w-6 text-primary" />
          </div>
          <SheetTitle className="text-center text-xl">
            {steps[currentStep].title}
          </SheetTitle>
          <SheetDescription className="text-center">
            {steps[currentStep].description}
          </SheetDescription>
        </SheetHeader>
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
        <SheetFooter className="sm:justify-center mt-6">
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? "Get Started" : "Next"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default OnboardingDialog;