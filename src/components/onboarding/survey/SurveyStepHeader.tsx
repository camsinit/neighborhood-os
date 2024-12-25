import { LucideIcon } from "lucide-react";

interface SurveyStepHeaderProps {
  icon: LucideIcon;
  title: string;
}

export const SurveyStepHeader = ({ icon: Icon, title }: SurveyStepHeaderProps) => {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h2 className="text-xl font-semibold">
        {title}
      </h2>
    </div>
  );
};