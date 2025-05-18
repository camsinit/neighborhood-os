
import React from 'react';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

/**
 * OnboardingProgress component
 * 
 * Displays a visual progress indicator for the onboarding process.
 * Shows a series of dots representing each step, with the current step highlighted.
 * 
 * @param currentStep - The current step index (0-based)
 * @param totalSteps - The total number of steps in the onboarding flow
 */
const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <div className="flex justify-center space-x-2 pt-4">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`transition-all duration-300 h-2 rounded-full ${
            index === currentStep
              ? 'bg-primary w-4' // Current step: highlighted and wider
              : index < currentStep
              ? 'bg-primary/60 w-2' // Completed steps: slightly dimmed
              : 'bg-gray-200 w-2' // Future steps: light gray
          }`}
          aria-label={`Step ${index + 1} of ${totalSteps}`}
          role="progressbar"
          aria-valuenow={(index + 1) * (100 / totalSteps)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      ))}
    </div>
  );
};

export default OnboardingProgress;
