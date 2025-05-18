
/**
 * SurveyProgress component
 * 
 * This component displays a progress indicator for multi-step forms.
 * It shows the current step out of the total steps and includes a
 * visual progress bar.
 */
import { Progress } from "@/components/ui/progress";

interface SurveyProgressProps {
  currentStep: number;
  totalSteps: number;
}

const SurveyProgress = ({ currentStep, totalSteps }: SurveyProgressProps) => {
  // Calculate the progress percentage
  // This determines how wide our colored progress bar should be
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
  
  return (
    <div className="w-full space-y-2 mt-4">
      {/* Step counter - Shows text indicating which step we're on */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Step {currentStep + 1} of {totalSteps}</span>
        <span>{Math.round(progressPercentage)}% Complete</span>
      </div>
      
      {/* 
        Use the Shadcn UI Progress component with explicit styling to ensure visibility
        The Progress component needs to have its indicator styled properly to show progress
      */}
      <Progress 
        value={progressPercentage} 
        className="h-2.5 bg-secondary" 
        aria-label="Survey progress"
      />
    </div>
  );
};

export default SurveyProgress;
