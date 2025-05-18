
/**
 * SurveyProgress component
 * 
 * This component displays a progress indicator for multi-step forms.
 * It shows the current step out of the total steps and includes a
 * visual progress bar with animated color transitions.
 */
import { Progress } from "@/components/ui/progress";
import { Glow } from "@/components/ui/glow";

interface SurveyProgressProps {
  currentStep: number;
  totalSteps: number;
}

const SurveyProgress = ({ currentStep, totalSteps }: SurveyProgressProps) => {
  // Calculate the progress percentage
  // This determines how wide our colored progress bar should be
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
  
  return (
    <div className="w-full space-y-2 mb-6 relative">
      {/* Add subtle glow effect behind the progress bar */}
      <div className="absolute inset-0 -top-4 opacity-30">
        <Glow variant="top" />
      </div>
      
      {/* Step counter - Shows text indicating which step we're on */}
      <div className="flex justify-between text-sm font-medium">
        <span className="text-primary">Step {currentStep + 1} of {totalSteps}</span>
        <span className="text-primary/80">{Math.round(progressPercentage)}% Complete</span>
      </div>
      
      {/* 
        Progress component with enhanced styling for better visibility
        We're using a gradient background and increased height for better visual impact
      */}
      <Progress 
        value={progressPercentage} 
        className="h-3 bg-secondary/40 rounded-full overflow-hidden shadow-sm" 
        aria-label="Survey progress"
      />
      
      {/* Visual indicators for each step */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div 
            key={index}
            className={`flex flex-col items-center transition-all duration-300 ${
              index <= currentStep ? 'opacity-100' : 'opacity-40'
            }`}
          >
            {/* Step indicator dot */}
            <div 
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index < currentStep 
                  ? 'bg-primary/70' // completed step
                  : index === currentStep 
                    ? 'bg-primary animate-pulse' // current step with pulse animation
                    : 'bg-gray-300' // future step
              }`}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SurveyProgress;
