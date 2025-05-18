
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUser } from "@supabase/auth-helpers-react";

// Import survey steps
import { BasicInfoStep } from "./survey/steps/BasicInfoStep";
import { ContactInfoStep } from "./survey/steps/ContactInfoStep";
import { AddressStep } from "./survey/steps/AddressStep";
import { ProfilePhotoStep } from "./survey/steps/ProfilePhotoStep";
import { SkillsStep } from "./survey/steps/SkillsStep";
import SurveyProgress from "./survey/SurveyProgress";
import SurveyStepHeader from "./survey/SurveyStepHeader";
import { CompletionScreen } from "./survey/components/CompletionScreen";
import { SurveyNavigation } from "./survey/components/SurveyNavigation";
import { useSurveyForm } from "./survey/hooks/useSurveyForm";

interface SurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Multi-step survey dialog for collecting user information during onboarding
 * 
 * This component collects basic profile information from users to complete
 * their onboarding process including:
 * - Basic info (first name, last name)
 * - Contact info (email, phone)
 * - Address info
 * - Profile photo
 * - Skills
 */
const SurveyDialog = ({ open, onOpenChange }: SurveyDialogProps) => {
  console.log("[DEBUG] SurveyDialog rendering, open:", open);
  
  // Get form state and handlers from custom hook
  const {
    formData,
    setters,
    surveyState,
    actions
  } = useSurveyForm(() => {
    // This callback is called when the form is successfully submitted
    setTimeout(() => {
      onOpenChange(false);
    }, 2000);
  });
  
  // Add effect to log when currentStep changes
  useEffect(() => {
    console.log("[DEBUG] SurveyDialog - currentStep changed:", surveyState.currentStep);
  }, [surveyState.currentStep]);
  
  // Define the steps for the survey
  const steps = [
    {
      title: "Basic Information",
      description: "Let's start with your name",
      component: (
        <BasicInfoStep
          firstName={formData.firstName}
          lastName={formData.lastName}
          onFirstNameChange={setters.setFirstName}
          onLastNameChange={setters.setLastName}
        />
      )
    },
    {
      title: "Contact Information",
      description: "How can neighbors reach you?",
      component: (
        <ContactInfoStep
          email={formData.email}
          phone={formData.phone}
          onEmailChange={setters.setEmail}
          onPhoneChange={setters.setPhone}
        />
      )
    },
    {
      title: "Home Address",
      description: "Where do you live in the neighborhood?",
      component: (
        <AddressStep
          address={formData.address}
          onAddressChange={setters.setAddress}
        />
      )
    },
    {
      title: "Profile Photo",
      description: "Add a photo so neighbors can recognize you",
      component: (
        <ProfilePhotoStep
          onPhotoChange={setters.setProfilePhoto}
          photoUrl={formData.photoUrl}
          setPhotoUrl={setters.setPhotoUrl}
        />
      )
    },
    {
      title: "Your Skills",
      description: "Share skills you'd be willing to offer neighbors",
      component: (
        <SkillsStep
          selectedSkills={formData.skills}
          onSkillsChange={setters.setSkills}
        />
      )
    }
  ];
  
  // Get current step data
  const currentStepData = steps[surveyState.currentStep];
  
  // Log progress information
  console.log("[DEBUG] Progress info:", {
    currentStep: surveyState.currentStep,
    totalSteps: steps.length,
    progressPercentage: ((surveyState.currentStep + 1) / steps.length) * 100
  });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
        {/* Show success state when complete */}
        {surveyState.isComplete ? (
          <CompletionScreen />
        ) : (
          <>
            {/* Progress Indicator - Moved to the top */}
            <SurveyProgress 
              currentStep={surveyState.currentStep} 
              totalSteps={steps.length} 
            />
            
            {/* Step Header */}
            <SurveyStepHeader
              title={currentStepData.title}
              description={currentStepData.description}
            />
            
            {/* Step Content */}
            <div className="py-4">
              {currentStepData.component}
            </div>
            
            {/* Navigation Buttons */}
            <SurveyNavigation
              currentStep={surveyState.currentStep}
              totalSteps={steps.length}
              isSubmitting={surveyState.isSubmitting}
              onBack={() => actions.handleBack(onOpenChange)}
              onNext={actions.handleNext}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SurveyDialog;
