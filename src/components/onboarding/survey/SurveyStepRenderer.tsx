
import { SurveyFormData } from "./types/surveyTypes";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { ContactInfoStep } from "./steps/ContactInfoStep";
import { AddressStep } from "./steps/AddressStep";
import { ProfileImageStep } from "./steps/ProfileImageStep";
import { SkillsStep } from "./steps/SkillsStep";

/**
 * SurveyStepRenderer component
 * 
 * Handles rendering the appropriate step component based on the current step index.
 * This component encapsulates all the step-specific logic and props passing.
 */
interface SurveyStepRendererProps {
  currentStep: number;
  formData: SurveyFormData;
  handleChange: (field: keyof SurveyFormData, value: any) => void;
}

export const SurveyStepRenderer = ({
  currentStep,
  formData,
  handleChange,
}: SurveyStepRendererProps) => {
  // Render the appropriate step component based on current step
  switch (currentStep) {
    case 0:
      return (
        <BasicInfoStep
          firstName={formData.firstName}
          lastName={formData.lastName}
          onFirstNameChange={(value) => handleChange("firstName", value)}
          onLastNameChange={(value) => handleChange("lastName", value)}
        />
      );
    
    case 1:
      return (
        <ContactInfoStep
          email={formData.email}
          phone={formData.phone}
          onEmailChange={(value) => handleChange("email", value)}
          onPhoneChange={(value) => handleChange("phone", value)}
        />
      );
    
    case 2:
      return (
        <AddressStep
          address={formData.address}
          onAddressChange={(value) => handleChange("address", value)}
        />
      );
    
    case 3:
      return <ProfileImageStep />;
    
    case 4:
      return (
        <SkillsStep
          selectedSkills={formData.skills}
          onSkillsChange={(value) => handleChange("skills", value)}
        />
      );
    
    default:
      return null;
  }
};
