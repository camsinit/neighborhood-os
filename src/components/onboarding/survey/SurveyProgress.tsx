
/**
 * SurveyProgress component
 * 
 * This component displays a progress indicator for multi-step forms.
 * It shows the current step out of the total steps and includes a
 * visual progress bar.
 */
import { Progress } from "@/components/ui/progress";
import { useEffect, useRef } from "react";

interface SurveyProgressProps {
  currentStep: number;
  totalSteps: number;
}

const SurveyProgress = ({ currentStep, totalSteps }: SurveyProgressProps) => {
  // Setup render counter to track re-renders
  const renderCount = useRef(0);
  renderCount.current += 1;

  // Log when this component renders with new props
  console.log("[DEBUG] SurveyProgress rendering:", { 
    currentStep, 
    totalSteps, 
    renderCount: renderCount.current 
  });
  
  // Calculate the progress percentage
  // This determines how wide our colored progress bar should be
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  // Add effect to log when progress percentage changes
  useEffect(() => {
    console.log("[DEBUG] Progress percentage calculated:", progressPercentage);
  }, [progressPercentage]);
  
  return (
    <div className="w-full space-y-2 mb-4">
      {/* Step counter - Shows text indicating which step we're on */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Step {currentStep + 1} of {totalSteps}</span>
        <span>{Math.round(progressPercentage)}% Complete</span>
      </div>
      
      {/* 
        Progress component with explicit styling to ensure visibility
        We're using primary color for the indicator and making sure the height is sufficient
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
