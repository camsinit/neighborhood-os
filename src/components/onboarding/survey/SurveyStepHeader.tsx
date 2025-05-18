
/**
 * SurveyStepHeader component
 * 
 * This component displays the title and description for each step
 * in a multi-step survey form.
 */
interface SurveyStepHeaderProps {
  title: string;
  description: string;
}

const SurveyStepHeader = ({ title, description }: SurveyStepHeaderProps) => {
  return (
    <div className="space-y-1.5 text-center sm:text-left">
      <h2 className="text-lg sm:text-xl font-semibold leading-7 tracking-tight">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
};

export default SurveyStepHeader;
