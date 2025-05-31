
import { useState, useCallback } from "react";
import { SurveyFormData } from "../types/surveyTypes";

/**
 * Custom hook for managing survey state
 * 
 * Handles form data, validation state, and navigation between steps.
 * Now includes password field for guest onboarding flow.
 */
export const useSurveyState = () => {
  // Check if we're in guest mode
  const isGuestMode = !!localStorage.getItem('guestOnboarding');
  
  // Initialize form data with default values
  const [formData, setFormData] = useState<SurveyFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "", // New field for guest onboarding
    address: "",
    bio: "",
    profileImage: null,
    skills: [],
    skillAvailability: "",
    skillTimePreferences: [],
    emailVisible: true,
    phoneVisible: false,
    addressVisible: false,
  });

  // Track current step in the survey
  const [currentStep, setCurrentStep] = useState(0);

  // Track validation state for each field
  const [validationState, setValidationState] = useState<Record<string, boolean>>({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    password: false,
    address: false,
    contactVisibility: false,
  });

  // Track skills survey completion state
  const [skillsSurveyState, setSkillsSurveyState] = useState({
    hasCompletedSurvey: false,
    hasSelectedSkills: false,
  });

  // Handle form field changes
  const handleChange = useCallback((field: keyof SurveyFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Handle validation state changes
  const handleValidation = useCallback((field: string, isValid: boolean) => {
    setValidationState(prev => ({
      ...prev,
      [field]: isValid,
    }));
  }, []);

  // Handle skills survey state changes
  const handleSkillsSurveyStateChange = useCallback((hasCompleted: boolean, hasSkills: boolean) => {
    setSkillsSurveyState({
      hasCompletedSurvey: hasCompleted,
      hasSelectedSkills: hasSkills,
    });
  }, []);

  // Check if current step is valid
  const isCurrentStepValid = useCallback(() => {
    switch (currentStep) {
      case 0: // Basic Info
        return validationState.firstName && validationState.lastName;
      case 1: // Contact Info
        const contactValid = validationState.email && validationState.phone && validationState.contactVisibility;
        // In guest mode, also require password
        return isGuestMode ? contactValid && validationState.password : contactValid;
      case 2: // Address
        return validationState.address;
      case 3: // Profile Image
        return true; // Optional step
      case 4: // Skills
        return skillsSurveyState.hasCompletedSurvey;
      default:
        return false;
    }
  }, [currentStep, validationState, skillsSurveyState, isGuestMode]);

  // Navigate to next step
  const handleNext = useCallback((onComplete?: () => void, totalSteps?: number) => {
    const nextStep = currentStep + 1;
    
    if (totalSteps && nextStep >= totalSteps) {
      // Survey is complete
      onComplete?.();
    } else {
      setCurrentStep(nextStep);
    }
  }, [currentStep]);

  // Navigate to previous step
  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  return {
    formData,
    currentStep,
    validationState,
    skillsSurveyState,
    isGuestMode,
    handleChange,
    handleValidation,
    handleSkillsSurveyStateChange,
    isCurrentStepValid,
    handleNext,
    handlePrevious,
  };
};
