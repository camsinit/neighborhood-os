
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
  
  // Form data state with proper initialization
  const [formData, setFormData] = useState<SurveyFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    bio: "",
    skills: [],
    emailVisible: true,
    phoneVisible: false,
    addressVisible: false,
    profileImage: null, // Required now
    skillAvailability: "",
    skillTimePreferences: [],
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
   */
  const isCurrentStepValid = (): boolean => {
    switch (currentStep) {
      case 0: // Basic Information
        return formData.firstName.trim() !== "" && formData.lastName.trim() !== "";
      
      case 1: // Contact Information  
        return formData.email.trim() !== "" && 
               formData.password.trim() !== "" && 
               formData.email.includes("@");
      
      case 2: // Address
        return formData.address.trim() !== "";
      
      case 3: // Profile Image (now required)
        return formData.profileImage !== null;
      
      case 4: // Skills & Interests
        // Must complete the skills mini-survey (reach the summary step)
        return skillsSurveyState.hasCompletedSurvey;
      
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
  };
};
