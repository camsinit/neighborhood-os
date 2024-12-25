import { Button } from "@/components/ui/button";

interface OnboardingNavigationProps {
  currentStep: number;
  isLastStep: boolean;
  onNext: () => void;
  onBack: () => void;
}

const OnboardingNavigation = ({ 
  currentStep, 
  isLastStep, 
  onNext, 
  onBack 
}: OnboardingNavigationProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Button onClick={onNext}>
        {isLastStep ? "Get Started" : "Next"}
      </Button>
      <button
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        {currentStep === 0 ? "Login" : "Back"}
      </button>
    </div>
  );
};

export default OnboardingNavigation;