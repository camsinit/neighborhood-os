
import React from 'react';

interface SurveyStepHeaderProps {
  title: string;
  description: string;
}

/**
 * SurveyStepHeader component
 * 
 * This component displays the title and description for each step
 * of the survey with enhanced visual styling
 */
const SurveyStepHeader = ({ title, description }: SurveyStepHeaderProps) => {
  return (
    <div className="space-y-2 text-center mb-4">
      <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
};

export default SurveyStepHeader;
