/**
 * useSurveyNavigation hook
 * 
 * This hook manages the navigation state and logic for moving between survey steps.
 */
import { useState } from "react";
import { toast } from "sonner";

interface SurveyNavigationProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    profilePhoto: File | null;
    skills: string[];
  };
  handleSubmit: () => void;
}

export const useSurveyNavigation = ({ formData, handleSubmit }: SurveyNavigationProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  // Handle next step button click
  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 0) {
      if (!formData.firstName.trim()) {
        toast.error("Please enter your first name");
        return;
      }
      if (!formData.lastName.trim()) {
        toast.error("Please enter your last name");
        return;
      }
    }
    
    if (currentStep === 1) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }
      if (!formData.phone.trim() || formData.phone.replace(/\D/g, "").length < 10) {
        toast.error("Please enter a valid phone number");
        return;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.address.trim()) {
        toast.error("Please enter your address");
        return;
      }
    }
    
    if (currentStep === 3) {
      if (!formData.profilePhoto) {
        toast.error("Please upload a profile photo");
        return;
      }
    }
    
    // Skills step validation - not strictly required but we encourage at least one
    if (currentStep === 4 && formData.skills.length === 0) {
      const confirmContinue = window.confirm("You haven't selected any skills. Are you sure you want to continue without adding skills?");
      if (!confirmContinue) {
        return;
      }
    }
    
    // If we're on the last step, submit the form
    if (currentStep === 4) { // Assuming there are 5 steps (0-4)
      handleSubmit();
      return;
    }
    
    // Otherwise, go to the next step
    setCurrentStep(currentStep + 1);
  };
  
  // Handle back button click
  const handleBack = (onOpenChange: (open: boolean) => void) => {
    if (currentStep === 0) {
      // First step, close the dialog
      onOpenChange(false);
    } else {
      // Go back one step
      setCurrentStep(currentStep - 1);
    }
  };
  
  return {
    currentStep,
    actions: {
      handleNext,
      handleBack
    }
  };
};
