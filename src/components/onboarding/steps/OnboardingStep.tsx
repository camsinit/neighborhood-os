import { LucideIcon } from "lucide-react";

interface OnboardingStepProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const OnboardingStep = ({ icon: Icon, title, description }: OnboardingStepProps) => {
  return (
    <div>
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h2 className="text-center text-xl font-semibold">
        {title}
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        {description}
      </p>
    </div>
  );
};

export default OnboardingStep;