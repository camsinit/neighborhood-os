import { useState } from "react";

/**
 * Survey form data interface
 */
export interface SurveyData {
  email: string;
  firstName: string;
  lastName: string;
  neighborhoodName: string;
  city: string;
  state: string;
  neighborsToOnboard: number;
  aiCodingExperience: string;
  openSourceInterest: string;
}

/**
 * Custom hook for managing waitlist survey form state
 */
export const useWaitlistSurveyForm = (initialEmail: string) => {
  // Debug: Log the initial email being passed
  console.log("useWaitlistSurveyForm received initialEmail:", initialEmail);
  
  // Form data state with pre-populated email
  const [formData, setFormData] = useState<SurveyData>({
    email: initialEmail,
    firstName: "",
    lastName: "",
    neighborhoodName: "",
    city: "",
    state: "",
    neighborsToOnboard: 0,
    aiCodingExperience: "",
    openSourceInterest: ""
  });

  // Debug: Log the actual form data email
  console.log("Form data email:", formData.email);

  /**
   * Handle input field changes
   */
  const updateField = (field: keyof SurveyData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Validation functions for each step
   */
  const validateStep1 = () => {
    return !!(
      formData.email && 
      formData.firstName && 
      formData.lastName && 
      formData.neighborhoodName && 
      formData.city && 
      formData.state
    );
  };

  const validateStep2 = () => {
    return !!(
      formData.neighborsToOnboard >= 0 && 
      formData.aiCodingExperience && 
      formData.openSourceInterest
    );
  };

  return {
    formData,
    updateField,
    validateStep1,
    validateStep2
  };
};