
import { useState } from "react";
import { SurveyFormData } from "./types/surveyTypes";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { ContactInfoStep } from "./steps/ContactInfoStep";
import { AddressStep } from "./steps/AddressStep";
import { ProfileImageStep } from "./steps/ProfileImageStep";
// EnhancedSkillsStep removed - skills onboarding moved to Skills page

/**
 * SurveyStepRenderer component
 * 
 * Handles rendering the appropriate step component based on the current step index.
 * This component encapsulates all the step-specific logic and props passing.
 * UPDATED: Removed skills step - skills onboarding moved to Skills page for "contribute to view" approach
 */
interface SurveyStepRendererProps {
  currentStep: number;
  formData: SurveyFormData;
  handleChange: (field: keyof SurveyFormData, value: any) => void;
  handleValidation: (field: string, isValid: boolean) => void;
  // Skills-related props removed - skills onboarding moved to Skills page
}

export const SurveyStepRenderer = ({
  currentStep,
  formData,
  handleChange,
  handleValidation,
  // Skills-related props removed
}: SurveyStepRendererProps) => {
  
  // Handle profile image change
  const handleProfileImageChange = (file: File | null) => {
    handleChange("profileImage", file);
  };

  // Unified flow for both OAuth and manual users
  switch (currentStep) {
    case 0:
      return (
        <BasicInfoStep
          firstName={formData.firstName}
          lastName={formData.lastName}
          yearMovedIn={formData.yearMovedIn}
          onFirstNameChange={(value) => handleChange('firstName', value)}
          onLastNameChange={(value) => handleChange('lastName', value)}
          onYearMovedInChange={(value) => handleChange('yearMovedIn', value)}
          onValidation={handleValidation}
          isOAuthUser={formData.authMethod === 'oauth'}
          isReadOnly={formData.authMethod === 'oauth' && formData.isDataPrePopulated}
        />
      );
    case 1:
      return (
        <div className="space-y-6">
          <ContactInfoStep
            email={formData.email}
            phone={formData.phone}
            password={formData.password || ''}
            emailVisible={formData.emailVisible}
            phoneVisible={formData.phoneVisible}
            onEmailChange={(value) => handleChange('email', value)}
            onPhoneChange={(value) => handleChange('phone', value)}
            onPasswordChange={(value) => handleChange('password', value)}
            onEmailVisibleChange={(value) => handleChange('emailVisible', value)}
            onPhoneVisibleChange={(value) => handleChange('phoneVisible', value)}
            onValidation={handleValidation}
            isOAuthUser={formData.authMethod === 'oauth'}
          />
          <AddressStep
            address={formData.address}
            onAddressChange={(value) => handleChange('address', value)}
            onValidation={handleValidation}
          />
        </div>
      );
    case 2:
      return (
        <ProfileImageStep
          onImageChange={handleProfileImageChange}
          initialImageUrl={formData.profileImageUrl}
        />
      );
    default:
      return <div>Unknown step</div>;
  }
};
