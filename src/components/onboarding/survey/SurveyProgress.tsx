
/**
 * SurveyProgress component
 * 
 * Displays the progress bar and step indicator for the multi-step survey.
 * Now properly accounts for the skills mini-survey progress within the skills step.
 * UPDATED: Progress now starts at 0% on first step and reaches 100% when skills survey is completed.
 */
interface SurveyProgressProps {
  currentStep: number;
  totalSteps: number;
  // New props to track skills mini-survey progress
  skillsSurveyProgress?: {
    currentStep: number;
    totalSteps: number;
    hasCompleted: boolean;
  };
}

export const SurveyProgress = ({ 
  currentStep, 
  totalSteps, 
  skillsSurveyProgress 
}: SurveyProgressProps) => {
  
  /**
   * Calculate the actual progress percentage including skills mini-survey
   * Updated to start at 0% and reach 100% when skills survey is completed
   */
  const calculateProgress = () => {
    // If we're not on the skills step (step 4), use normal calculation
    if (currentStep !== 4) {
      // Changed from (currentStep + 1) to currentStep to start at 0%
      return (currentStep / totalSteps) * 100;
    }
    
    // If we're on the skills step, factor in mini-survey progress
    if (skillsSurveyProgress) {
      const { currentStep: miniStep, totalSteps: miniTotal, hasCompleted } = skillsSurveyProgress;
      
      // If skills survey is completed, show 100%
      if (hasCompleted) {
        return 100;
      }
      
      // Calculate progress within the skills step
      // Steps 0-3 are 80% of total progress (4/5 = 0.8)
      // Skills mini-survey makes up the remaining 20%
      const baseProgress = (currentStep / totalSteps) * 100; // 80% when on step 4
      const skillsProgress = ((miniStep + 1) / miniTotal) * (100 / totalSteps); // 20% * mini-progress
      
      return baseProgress + skillsProgress;
    }
    
    // Fallback to normal calculation
    return (currentStep / totalSteps) * 100;
  };
  
  const progress = calculateProgress();
  
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
