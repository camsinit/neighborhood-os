
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

const SurveyProgress = ({
  currentStep,
  totalSteps
}: SurveyProgressProps) => {
  // Calculate the progress percentage
  // This determines how wide our colored progress bar should be
  const progressPercentage = (currentStep + 1) / totalSteps * 100;
  
  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Step {currentStep + 1} of {totalSteps}</span>
        <span>{Math.round(progressPercentage)}% Complete</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
};

export default SurveyProgress;
