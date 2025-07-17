
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

  // Render the appropriate step component based on current step and auth method
  if (formData.authMethod === 'oauth') {
    // OAuth flow: Welcome -> About You -> Privacy
    switch (currentStep) {
      case 0: // Welcome screen with OAuth info
        return (
          <BasicInfoStep
            firstName={formData.firstName}
            lastName={formData.lastName}
            yearMovedIn={formData.yearMovedIn}
            onFirstNameChange={(value) => handleChange("firstName", value)}
            onLastNameChange={(value) => handleChange("lastName", value)}
            onYearMovedInChange={(value) => handleChange("yearMovedIn", value)}
            onValidation={handleValidation}
            isOAuthUser={true}
            isReadOnly={formData.isDataPrePopulated}
          />
        );
      
      case 1: // Address and Contact (combined)
        return (
          <div className="space-y-6">
            <AddressStep
              address={formData.address}
              onAddressChange={(value) => handleChange("address", value)}
              onValidation={handleValidation}
            />
            <div className="space-y-4">
              <h4 className="font-medium">Phone Number (Optional)</h4>
              <ContactInfoStep
                email={formData.email}
                phone={formData.phone}
                password="" // OAuth users don't need password
                emailVisible={formData.emailVisible}
                phoneVisible={formData.phoneVisible}
                onEmailChange={(value) => handleChange("email", value)}
                onPhoneChange={(value) => handleChange("phone", value)}
                onPasswordChange={() => {}} // No-op for OAuth
                onEmailVisibleChange={(value) => handleChange("emailVisible", value)}
                onPhoneVisibleChange={(value) => handleChange("phoneVisible", value)}
                onValidation={handleValidation}
                isOAuthUser={true}
              />
            </div>
          </div>
        );
      
      case 2: // Privacy settings only
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Privacy Settings</h3>
            <p className="text-sm text-muted-foreground">
              Choose what information to share with your neighbors.
            </p>
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Email Visibility</label>
                  <p className="text-xs text-muted-foreground">Allow neighbors to see your email</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.emailVisible}
                  onChange={(e) => handleChange("emailVisible", e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Phone Visibility</label>
                  <p className="text-xs text-muted-foreground">Allow neighbors to see your phone number</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.phoneVisible}
                  onChange={(e) => handleChange("phoneVisible", e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  } else {
    // Manual flow: Basic Info -> Contact & Auth -> Address -> Profile Image
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep
            firstName={formData.firstName}
            lastName={formData.lastName}
            yearMovedIn={formData.yearMovedIn}
            onFirstNameChange={(value) => handleChange("firstName", value)}
            onLastNameChange={(value) => handleChange("lastName", value)}
            onYearMovedInChange={(value) => handleChange("yearMovedIn", value)}
            onValidation={handleValidation}
            isOAuthUser={false}
            isReadOnly={false}
          />
        );
      
      case 1:
        return (
          <ContactInfoStep
            email={formData.email}
            phone={formData.phone}
            password={formData.password || ""}
            emailVisible={formData.emailVisible}
            phoneVisible={formData.phoneVisible}
            onEmailChange={(value) => handleChange("email", value)}
            onPhoneChange={(value) => handleChange("phone", value)}
            onPasswordChange={(value) => handleChange("password", value)}
            onEmailVisibleChange={(value) => handleChange("emailVisible", value)}
            onPhoneVisibleChange={(value) => handleChange("phoneVisible", value)}
            onValidation={handleValidation}
            isOAuthUser={false}
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
            initialImageUrl={formData.profileImageUrl}
          />
        );
      
      default:
        return null;
    }
  }
};
