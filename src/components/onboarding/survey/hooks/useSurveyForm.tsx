
/**
 * useSurveyForm hook
 * 
 * This is the main hook that combines all the sub-hooks for form state,
 * navigation, and submission to provide a complete form management solution.
 */
import { useFormState } from "./survey/useFormState";
import { useSurveyNavigation } from "./survey/useSurveyNavigation";
import { useFormSubmission } from "./survey/useFormSubmission";

/**
 * Custom hook to manage survey form state and submission
 * 
 * This hook centralizes the state management for all survey steps
 * and handles submission of the completed survey data to Supabase
 */
export const useSurveyForm = (onComplete: () => void) => {
  // Get form state from the useFormState hook
  const { formData, setters } = useFormState();
  
  // Get form submission handlers and state
  const { submissionState, handleSubmit } = useFormSubmission({ 
    formData, 
    onComplete 
  });
  
  // Get navigation state and handlers
  const { currentStep, actions } = useSurveyNavigation({ 
    formData, 
    handleSubmit 
  });
  
  return {
    formData,
    setters,
    surveyState: {
      currentStep,
      isSubmitting: submissionState.isSubmitting,
      isComplete: submissionState.isComplete
    },
    actions: {
      handleNext: actions.handleNext,
      handleBack: actions.handleBack
    }
  };
};
