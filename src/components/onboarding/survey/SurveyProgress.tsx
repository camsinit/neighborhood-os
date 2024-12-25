interface SurveyProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const SurveyProgress = ({ currentStep, totalSteps }: SurveyProgressProps) => {
  return (
    <div className="flex justify-center space-x-1 pt-4">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`h-1.5 w-12 rounded-full ${
            index === currentStep ? "bg-primary" : "bg-primary/20"
          }`}
        />
      ))}
    </div>
  );
};