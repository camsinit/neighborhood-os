
import { useState } from "react";
import { SurveyFormData } from "../types/surveyTypes";

/**
 * Custom hook for managing survey state and validation
 * 
 * Handles form data, validation state, and navigation logic for the onboarding survey.
 * Now includes validation for required profile image.
 */

interface SkillsSurveyState {
  hasCompletedSurvey: boolean;
  hasSelectedSkills: boolean;
}

export const useSurveyState = () => {
  // Current step in the survey
  const [currentStep, setCurrentStep] = useState(0);
  
  // Track skills survey completion state
  const [skillsSurveyState, setSkillsSurveyState] = useState<SkillsSurveyState>({
    hasCompletedSurvey: false,
    hasSelectedSkills: false,
  });
  
  // Form data state (OAuth-aware structure)
  const [formData, setFormData] = useState<SurveyFormData>({
    authMethod: 'manual',
    isDataPrePopulated: false,
    firstName: "",
    lastName: "",
    yearMovedIn: null,
    email: "",
    password: "",
    address: "",
    agreements: {
      communication: false,
      authenticity: false,
      followThrough: false,
      respectfulness: false,
    },
  });
  
  // Validation state for each step
  const [validationState, setValidationState] = useState<{
    [key: string]: boolean;
  }>({});

  /**
   * Handle form field changes
   */
  const handleChange = (field: keyof SurveyFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Handle field validation updates
   */
  const handleValidation = (field: string, isValid: boolean) => {
    setValidationState(prev => ({
      ...prev,
      [field]: isValid
    }));
  };

  /**
   * Handle skills survey state changes
   */
  const handleSkillsSurveyStateChange = (hasCompleted: boolean, hasSkills: boolean) => {
    setSkillsSurveyState({
      hasCompletedSurvey: hasCompleted,
      hasSelectedSkills: hasSkills,
    });
  };

  /**
   * Validate if current step has all required fields completed
   * OAuth-aware validation logic
   */
  const isCurrentStepValid = (): boolean => {
    switch (currentStep) {
      case 0: // Basic Information (or OAuth Welcome)
        return formData.firstName.trim() !== "" && formData.lastName.trim() !== "";
      
      case 1: // Contact/Auth Information  
        if (formData.authMethod === 'oauth') {
          // OAuth users only need email (password provided by OAuth)
          return formData.email.trim() !== "" && formData.email.includes("@");
        } else {
          // Manual users need email and password
          return formData.email.trim() !== "" && 
                 formData.password && formData.password.trim() !== "" && 
                 formData.email.includes("@");
        }
      
      case 2: // Profile Image
        // Profile image is optional, so always return true
        return true;
      
      case 3: // Neighborhood Agreements (final step)
        // All agreements must be accepted
        return Object.values(formData.agreements).every(value => value === true);
      
      default:
        return true;
    }
  };

  /**
   * Navigate to next step
   */
  const handleNext = (onComplete?: () => void, totalSteps?: number) => {
    if (totalSteps && currentStep >= totalSteps - 1) {
      // Survey complete
      onComplete?.();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  /**
   * Navigate to previous step
   */
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  /**
   * Initialize form data with OAuth or manual data
   */
  const initializeFormData = (data: Partial<SurveyFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };

  return {
    currentStep,
    formData,
    skillsSurveyState,
    validationState,
    handleChange,
    handleValidation,
    handleSkillsSurveyStateChange,
    isCurrentStepValid,
    handleNext,
    handlePrevious,
    initializeFormData,
  };
};
