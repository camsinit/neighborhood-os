
/**
 * SurveyProgress component
 * 
 * Displays the progress bar and step indicator for the multi-step survey.
 */
interface SurveyProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const SurveyProgress = ({ currentStep, totalSteps }: SurveyProgressProps) => {
  // Calculate the progress percentage
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  return (
    <div className="space-y-2">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Step {currentStep + 1} of {totalSteps}</span>
        <span>{Math.round(progress)}% Complete</span>
      </div>
    </div>
  );
};
