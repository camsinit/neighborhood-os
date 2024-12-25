import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LucideIcon } from "lucide-react";

interface SurveyStepHeaderProps {
  icon: LucideIcon;
  title: string;
}

export const SurveyStepHeader = ({ icon: Icon, title }: SurveyStepHeaderProps) => {
  return (
    <DialogHeader>
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <DialogTitle className="text-center text-xl">
        {title}
      </DialogTitle>
    </DialogHeader>
  );
};