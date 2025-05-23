import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SurveyStepHeader } from "./survey/SurveyStepHeader";
import { SurveyProgress } from "./survey/SurveyProgress";
import { BasicInfoStep } from "./survey/steps/BasicInfoStep";
import { ContactInfoStep } from "./survey/steps/ContactInfoStep";
import { AddressStep } from "./survey/steps/AddressStep";
import { ProfileImageStep } from "./survey/steps/ProfileImageStep";
import { SkillCategory } from "./survey/steps/skills/SkillCategory";
import { SKILL_CATEGORIES } from "./survey/steps/skills/skillCategories";
import { useUser } from "@supabase/auth-helpers-react";
import { ArrowRight } from "lucide-react";

/**
 * Type definition for the survey form data
 */
interface SurveyFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  skills: string[];
}

/**
 * Props for the SurveyDialog component
 */
interface SurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => Promise<void>;
}

/**
 * SurveyDialog component
 * 
 * A multi-step survey form for collecting user information during onboarding.
 * It tracks form state, handles navigation between steps, and performs validation
 * before proceeding to the next step.
 */
const SurveyDialog = ({ open, onOpenChange, onComplete }: SurveyDialogProps) => {
  // Current step index
  const [step, setStep] = useState(0);
  
  // Form data state
  const [formData, setFormData] = useState<SurveyFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    skills: [],
  });
  
  // Loading state for submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useUser();
  
  // Define all steps in the survey
  const steps = [
    {
      title: "Basic Information",
      description: "Let's start with your name so your neighbors can get to know you.",
      component: (
        <BasicInfoStep
          firstName={formData.firstName}
          lastName={formData.lastName}
          onFirstNameChange={(value) => setFormData({ ...formData, firstName: value })}
          onLastNameChange={(value) => setFormData({ ...formData, lastName: value })}
        />
      ),
      validate: () => {
        if (!formData.firstName.trim()) {
          toast({ title: "First name is required" });
          return false;
        }
        if (!formData.lastName.trim()) {
          toast({ title: "Last name is required" });
          return false;
        }
        return true;
      }
    },
    {
      title: "Contact Information",
      description: "Your contact details help us keep you informed about community events and updates.",
      component: (
        <ContactInfoStep
          email={formData.email}
          phone={formData.phone}
          onEmailChange={(value) => setFormData({ ...formData, email: value })}
          onPhoneChange={(value) => setFormData({ ...formData, phone: value })}
        />
      ),
      validate: () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim() || !emailRegex.test(formData.email)) {
          toast({ title: "Valid email address is required" });
          return false;
        }
        
        const phoneDigits = formData.phone.replace(/\D/g, "");
        if (!formData.phone.trim() || phoneDigits.length < 10) {
          toast({ title: "Valid phone number is required" });
          return false;
        }
        
        return true;
      }
    },
    {
      title: "Address",
      description: "Your address helps us connect you with nearby neighbors and local events.",
      component: (
        <AddressStep
          address={formData.address}
          onAddressChange={(value) => setFormData({ ...formData, address: value })}
        />
      ),
      validate: () => {
        if (!formData.address.trim()) {
          toast({ title: "Address is required" });
          return false;
        }
        return true;
      }
    },
    {
      title: "Profile Picture",
      description: "Add a friendly photo to help build trust in the community.",
      component: <ProfileImageStep />,
      // No validation required for profile picture - it's optional
      validate: () => true
    },
    {
      title: "Skills & Expertise",
      description: "Share your skills to help neighbors know what you can contribute to the community.",
      component: (
        <SkillCategory
          title="Your Skills"
          skills={[
            ...SKILL_CATEGORIES.emergency.skills,
            ...SKILL_CATEGORIES.professional.skills,
            ...SKILL_CATEGORIES.maintenance.skills,
            ...SKILL_CATEGORIES.care.skills
          ]}
          selectedSkills={formData.skills}
          onSkillsChange={(skills) => setFormData({ ...formData, skills })}
        />
      ),
      validate: () => true // Skills are optional
    }
  ];

  /**
   * Handle moving to the next step or completing the survey
   */
  const handleNext = async () => {
    // Validate current step
    if (!steps[step].validate()) {
      return;
    }
    
    // If current step is the last one, submit the survey
    if (step === steps.length - 1) {
      await handleSubmit();
    } else {
      // Otherwise move to next step
      setStep(step + 1);
    }
  };

  /**
   * Handle moving to the previous step
   */
  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  /**
   * Submit the survey data to the database
   */
  const handleSubmit = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Update the user's profile in the database
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: `${formData.firstName} ${formData.lastName}`,
          phone_number: formData.phone,
          address: formData.address,
          skills: formData.skills,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Call the onComplete callback if provided
      if (onComplete) {
        await onComplete();
      } else {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
        onOpenChange(false);
        navigate("/home");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If dialog is not open, don't render anything
  if (!open) return null;

  // Get current step details
  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-100 via-pink-100 to-orange-100">
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg">
          {/* Step header */}
          <SurveyStepHeader 
            title={currentStep.title} 
          />
          
          {/* Step description */}
          <p className="text-center text-sm text-muted-foreground mb-6">
            {currentStep.description}
          </p>
          
          {/* Step content */}
          <div className="py-4">
            {currentStep.component}
          </div>
          
          {/* Progress indicator */}
          <SurveyProgress 
            currentStep={step} 
            totalSteps={steps.length} 
          />
          
          {/* Navigation buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={step === 0 || isSubmitting}
            >
              Back
            </Button>
            
            <div className="flex gap-2">
              {step < steps.length - 1 && (
                <Button 
                  variant="link" 
                  onClick={() => setStep(steps.length - 1)}
                  disabled={isSubmitting}
                >
                  Skip to end
                </Button>
              )}
              
              <Button 
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex items-center gap-1"
              >
                {step === steps.length - 1 ? (
                  isSubmitting ? "Completing..." : "Complete"
                ) : (
                  <>Next <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyDialog;
