
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SurveyStepHeader } from "./survey/SurveyStepHeader";
import { SurveyProgress } from "./survey/SurveyProgress";
import { getSurveySteps } from "./survey/config/surveySteps";
import { useUser } from "@supabase/auth-helpers-react";
import { SurveyFormData } from "./survey/types/surveyTypes";
import { AlertTriangle } from "lucide-react";

/**
 * SurveyDialog Component
 * 
 * Handles the multi-step form process for collecting user information during onboarding.
 * Manages state, validation, and submission of user profile data.
 */
interface SurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SurveyDialog = ({ open, onOpenChange }: SurveyDialogProps) => {
  // Form state management
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<SurveyFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    skills: [],
  });
  // Track validation errors for each step
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useUser();
  const steps = getSurveySteps(formData, setFormData);

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email || "" }));
    }
  }, [user]);

  // Validate current step data
  const validateCurrentStep = () => {
    const currentStepErrors: Record<string, string> = {};
    
    // Validation for basic info step
    if (step === 0) {
      if (!formData.firstName.trim()) {
        currentStepErrors.firstName = "First name is required";
      }
      if (!formData.lastName.trim()) {
        currentStepErrors.lastName = "Last name is required";
      }
    }
    
    // Validation for contact info step
    else if (step === 2) {
      if (!formData.email.trim()) {
        currentStepErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        currentStepErrors.email = "Please enter a valid email address";
      }
      
      if (!formData.phone.trim()) {
        currentStepErrors.phone = "Phone number is required";
      } else if (!/^\(\d{3}\) \d{3}-\d{4}$/.test(formData.phone)) {
        currentStepErrors.phone = "Please enter a valid phone number format";
      }
    }
    
    // Validation for address step
    else if (step === 3) {
      if (!formData.address.trim()) {
        currentStepErrors.address = "Address is required";
      }
    }
    
    setErrors(currentStepErrors);
    return Object.keys(currentStepErrors).length === 0;
  };

  const handleNext = async () => {
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      return;
    }
    
    if (step === steps.length - 1) {
      await submitProfile();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  const submitProfile = async () => {
    try {
      setIsSubmitting(true);
      
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Update profile information
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: `${formData.firstName} ${formData.lastName}`,
          phone_number: formData.phone,
          address: formData.address,
          skills: formData.skills,
          completed_onboarding: true // Mark onboarding as complete
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile Created",
        description: "Your profile has been successfully set up.",
      });

      // Close the dialog and navigate to home
      onOpenChange(false);
      navigate("/home");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render if dialog is closed
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-100 via-pink-100 to-orange-100">
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg">
          <SurveyStepHeader
            icon={steps[step].icon}
            title={steps[step].title}
          />
          <p className="text-center text-sm text-muted-foreground mb-6">
            {steps[step].description}
          </p>
          
          {/* Display validation errors if any */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm font-medium text-red-800">Please fix the following errors:</p>
              </div>
              <ul className="mt-2 text-sm text-red-700 list-disc pl-5">
                {Object.values(errors).map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="py-4">{steps[step].component}</div>
          
          <SurveyProgress currentStep={step} totalSteps={steps.length} />
          
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 0}
            >
              Back
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : step === steps.length - 1 ? "Complete" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyDialog;
