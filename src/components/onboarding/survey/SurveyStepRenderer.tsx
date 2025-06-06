
import { useState } from "react";
import { SurveyFormData } from "./types/surveyTypes";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { ContactInfoStep } from "./steps/ContactInfoStep";
import { AddressStep } from "./steps/AddressStep";
import { ProfileImageStep } from "./steps/ProfileImageStep";
import { EnhancedSkillsStep } from "./steps/EnhancedSkillsStep";

/**
 * SurveyStepRenderer component
 * 
 * Handles rendering the appropriate step component based on the current step index.
 * This component encapsulates all the step-specific logic and props passing.
 * Now tracks skills survey completion state for navigation validation.
 * 
 * UPDATED: Removed availability handling - onboarding no longer collects availability preferences
 */
interface SurveyStepRendererProps {
  currentStep: number;
  formData: SurveyFormData;
  handleChange: (field: keyof SurveyFormData, value: any) => void;
  handleValidation: (field: string, isValid: boolean) => void;
  onSkillsSurveyStateChange?: (hasCompleted: boolean, hasSkills: boolean) => void;
  onSkillsMiniSurveyProgress?: (currentStep: number, totalSteps: number, hasCompleted: boolean) => void;
}

export const SurveyStepRenderer = ({
  currentStep,
  formData,
  handleChange,
  handleValidation,
  onSkillsSurveyStateChange,
  onSkillsMiniSurveyProgress,
}: SurveyStepRendererProps) => {
  
  // Handle profile image change
  const handleProfileImageChange = (file: File | null) => {
    handleChange("profileImage", file);
  };

  // Render the appropriate step component based on current step
  switch (currentStep) {
    case 0:
      return (
        <BasicInfoStep
          firstName={formData.firstName}
          lastName={formData.lastName}
          onFirstNameChange={(value) => handleChange("firstName", value)}
          onLastNameChange={(value) => handleChange("lastName", value)}
          onValidation={handleValidation}
        />
      );
    
    case 1:
      return (
        <ContactInfoStep
          email={formData.email}
          phone={formData.phone}
          password={formData.password}
          emailVisible={formData.emailVisible}
          phoneVisible={formData.phoneVisible}
          addressVisible={formData.addressVisible}
          onEmailChange={(value) => handleChange("email", value)}
          onPhoneChange={(value) => handleChange("phone", value)}
          onPasswordChange={(value) => handleChange("password", value)}
          onEmailVisibleChange={(value) => handleChange("emailVisible", value)}
          onPhoneVisibleChange={(value) => handleChange("phoneVisible", value)}
          onAddressVisibleChange={(value) => handleChange("addressVisible", value)}
          onValidation={handleValidation}
        />
      );
    
    case 2:
      return (
        <AddressStep
          address={formData.address}
          onAddressChange={(value) => handleChange("address", value)}
          onValidation={handleValidation}
        />
      );
    
    case 3:
      return (
        <ProfileImageStep 
          onImageChange={handleProfileImageChange}
        />
      );
    
    case 4:
      return (
        <EnhancedSkillsStep
          selectedSkills={formData.skills}
          onSkillsChange={(value) => handleChange("skills", value)}
          onSurveyStateChange={onSkillsSurveyStateChange}
          onMiniSurveyProgress={onSkillsMiniSurveyProgress}
        />
      );
    
    default:
      return null;
  }
};
