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
  return;
};
export default SurveyProgress;