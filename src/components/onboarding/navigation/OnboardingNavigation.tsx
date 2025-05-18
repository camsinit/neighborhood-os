
import React from 'react';
import { Button } from '@/components/ui/button';

interface OnboardingNavigationProps {
  currentStep: number;
  isLastStep: boolean;
  onNext: () => void;
  onBack: () => void;
}

/**
 * OnboardingNavigation component
 * 
 * Provides navigation buttons for moving between onboarding steps
 * with smooth transitions and appropriate button labels.
 * 
 * @param currentStep - The current step index (0-based)
 * @param isLastStep - Whether this is the final step in the flow
 * @param onNext - Function to call when moving to next step
 * @param onBack - Function to call when moving to previous step
 */
const OnboardingNavigation: React.FC<OnboardingNavigationProps> = ({
  currentStep,
  isLastStep,
  onNext,
  onBack,
}) => {
  return (
    <div className="flex justify-between pt-8">
      <Button
        onClick={onBack}
        variant="outline"
        className="transition-all duration-300 hover:bg-gray-100"
      >
        {currentStep === 0 ? 'Cancel' : 'Back'}
      </Button>
      
      <Button 
        onClick={onNext}
        className="transition-all duration-300"
      >
        {isLastStep ? 'Get Started' : 'Next'}
      </Button>
    </div>
  );
};

export default OnboardingNavigation;
