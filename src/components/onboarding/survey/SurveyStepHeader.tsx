
/**
 * SurveyStepHeader component
 * 
 * Displays the title and icon for the current step of the survey.
 */
import { LucideIcon } from "lucide-react";

interface SurveyStepHeaderProps {
  title: string;
  icon?: LucideIcon;
}

export const SurveyStepHeader = ({ title, icon: Icon }: SurveyStepHeaderProps) => {
  return (
    <div className="text-center">
      {Icon && (
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      )}
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
    </div>
  );
};
