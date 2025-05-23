
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { SurveyStepHeader } from "./survey/SurveyStepHeader";
import { SurveyProgress } from "./survey/SurveyProgress";
import { SurveyFormData } from "./survey/types/surveyTypes";
import { BasicInfoStep } from "./survey/steps/BasicInfoStep";
import { ContactInfoStep } from "./survey/steps/ContactInfoStep";
import { AddressStep } from "./survey/steps/AddressStep";
import { ProfileImageStep } from "./survey/steps/ProfileImageStep";
import { SkillsStep } from "./survey/steps/SkillsStep";

/**
 * SurveyDialog component
 * 
 * A multi-step survey dialog that collects user information during onboarding.
 * Each step has its own component and validation.
 */
interface SurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
  isTestMode?: boolean; // New prop to indicate if we're in test mode
}

// Define the survey steps
const steps = [
  {
    title: "Basic Information",
    component: BasicInfoStep,
  },
  {
    title: "Contact Information",
    component: ContactInfoStep,
  },
  {
    title: "Address",
    component: AddressStep,
  },
  {
    title: "Profile Photo",
    component: ProfileImageStep,
  },
  {
    title: "Skills & Interests",
    component: SkillsStep,
  },
];

const SurveyDialog = ({ 
  open, 
  onOpenChange, 
  onComplete,
  isTestMode = false
}: SurveyDialogProps) => {
  // Current step index
  const [currentStep, setCurrentStep] = useState(0);
  
  // Form data
  const [formData, setFormData] = useState<SurveyFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    skills: [],
  });
  
  // Field validation state
  const [validFields, setValidFields] = useState<Record<string, boolean>>({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    address: false,
  });
  
  // Handle form field changes
  const handleChange = (field: keyof SurveyFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  // Handle field validation
  const handleValidation = (field: string, isValid: boolean) => {
    setValidFields((prev) => ({ ...prev, [field]: isValid }));
  };
  
  // Check if current step is valid
  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return validFields.firstName && validFields.lastName;
      case 1: // Contact Info
        return validFields.email && validFields.phone;
      case 2: // Address
        return validFields.address;
      default:
        return true;
    }
  };
  
  // Handle next step
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
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
  
  // Handle dialog close request
  const handleCloseRequest = (open: boolean) => {
    // If test mode, allow closing without warning
    if (isTestMode) {
      onOpenChange(open);
      return;
    }
    
    // In normal mode, show warning if trying to close
    if (!open) {
      // TODO: Add confirmation dialog before closing
      // For now, just close the dialog
      onOpenChange(open);
    } else {
      onOpenChange(open);
    }
  };
  
  // Get current step component
  const CurrentStepComponent = steps[currentStep].component;
  
  // Get test mode indicator for the dialog title
  const testModeIndicator = isTestMode ? " (Test Mode)" : "";
  
  return (
    <Dialog open={open} onOpenChange={handleCloseRequest}>
      <DialogContent className="sm:max-w-[500px]">
        {/* Test mode indicator */}
        {isTestMode && (
          <div className="bg-amber-50 border border-amber-200 rounded px-3 py-1 text-amber-700 text-sm mb-2">
            Test Mode - No changes will be saved to your profile
          </div>
        )}
        
        {/* Survey header */}
        <SurveyStepHeader title={`${steps[currentStep].title}${testModeIndicator}`} />
        
        {/* Progress indicator */}
        <SurveyProgress currentStep={currentStep} totalSteps={steps.length} />
        
        {/* Current step component */}
        <div className="py-4">
          {currentStep === 0 && (
            <BasicInfoStep
              firstName={formData.firstName}
              lastName={formData.lastName}
              onFirstNameChange={(value) => handleChange("firstName", value)}
              onLastNameChange={(value) => handleChange("lastName", value)}
            />
          )}
          
          {currentStep === 1 && (
            <ContactInfoStep
              email={formData.email}
              phone={formData.phone}
              onEmailChange={(value) => handleChange("email", value)}
              onPhoneChange={(value) => handleChange("phone", value)}
            />
          )}
          
          {currentStep === 2 && (
            <AddressStep
              address={formData.address}
              onAddressChange={(value) => handleChange("address", value)}
            />
          )}
          
          {currentStep === 3 && <ProfileImageStep />}
          
          {currentStep === 4 && (
            <SkillsStep
              selectedSkills={formData.skills} // Changed from skills to selectedSkills
              onSkillsChange={(value) => handleChange("skills", value)}
            />
          )}
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isCurrentStepValid() && currentStep < 3}
          >
            {currentStep < steps.length - 1 ? (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Complete
                <Check className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SurveyDialog;
