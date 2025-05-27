
import React from 'react';

/**
 * Props for the FormSection component
 */
interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * FormSection Component
 * 
 * Provides consistent spacing and typography for form sections within cards.
 * Helps organize related form fields together.
 */
export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children
}) => {
  return (
    <div className="space-y-4">
      {/* Section header */}
      <div>
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      
      {/* Section content */}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};
