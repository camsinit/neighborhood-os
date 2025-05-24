
import { useState } from "react";
import { SurveyFormData } from "../types/surveyTypes";

/**
 * Custom hook for managing survey state
 * 
 * Centralizes all survey state management including form data, validation,
 * current step tracking, and step validation logic.
 */
export const useSurveyState = () => {
  // Current step index
  const [currentStep, setCurrentStep] = useState(0);
  
  // Form data state
  const [formData, setFormData] = useState<SurveyFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    skills: [],
  });
  
  // Field validation state - updated to include contact visibility
  const [validFields, setValidFields] = useState<Record<string, boolean>>({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    address: false,
    contactVisibility: true, // Default to true since email is checked by default
  });
  
  // Handle form field changes
  const handleChange = (field: keyof SurveyFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  // Handle field validation
  const handleValidation = (field: string, isValid: boolean) => {
    setValidFields((prev) => ({ ...prev, [field]: isValid }));
  };
  
  // Check if current step is valid - updated to include contact visibility validation
  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return validFields.firstName && validFields.lastName;
      case 1: // Contact Info - now includes phone and contact visibility validation
        return validFields.email && validFields.phone && validFields.contactVisibility;
      case 2: // Address
        return validFields.address;
      default:
        return true;
    }
  };
  
  // Handle next step
  const handleNext = (onComplete?: () => void, totalSteps: number = 5) => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Complete the survey
      onComplete?.();
    }
  };
  
  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return {
    currentStep,
    formData,
    validFields,
    handleChange,
    handleValidation,
    isCurrentStepValid,
    handleNext,
    handlePrevious,
  };
};
