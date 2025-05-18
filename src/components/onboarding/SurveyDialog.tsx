
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Import survey steps
import { BasicInfoStep } from "./survey/steps/BasicInfoStep";
import { ContactInfoStep } from "./survey/steps/ContactInfoStep";
import { AddressStep } from "./survey/steps/AddressStep";
import { ProfilePhotoStep } from "./survey/steps/ProfilePhotoStep";
import { SkillsStep } from "./survey/steps/SkillsStep";
import SurveyProgress from "./survey/SurveyProgress";
import SurveyStepHeader from "./survey/SurveyStepHeader";

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
  // Navigation
  const navigate = useNavigate();
  const user = useUser();
  
  // Form state
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>(user?.email || "");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [skills, setSkills] = useState<string[]>([]);
  
  // Survey state
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // Define the steps for the survey
  const steps = [
    {
      title: "Basic Information",
      description: "Let's start with your name",
      component: (
        <BasicInfoStep
          firstName={firstName}
          lastName={lastName}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
        />
      )
    },
    {
      title: "Contact Information",
      description: "How can neighbors reach you?",
      component: (
        <ContactInfoStep
          email={email}
          phone={phone}
          onEmailChange={setEmail}
          onPhoneChange={setPhone}
        />
      )
    },
    {
      title: "Home Address",
      description: "Where do you live in the neighborhood?",
      component: (
        <AddressStep
          address={address}
          onAddressChange={setAddress}
        />
      )
    },
    {
      title: "Profile Photo",
      description: "Add a photo so neighbors can recognize you",
      component: (
        <ProfilePhotoStep
          onPhotoChange={setProfilePhoto}
          photoUrl={photoUrl}
          setPhotoUrl={setPhotoUrl}
        />
      )
    },
    {
      title: "Your Skills",
      description: "Share skills you'd be willing to offer neighbors",
      component: (
        <SkillsStep
          selectedSkills={skills}
          onSkillsChange={setSkills}
        />
      )
    }
  ];
  
  // Handle next step button click
  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 0) {
      if (!firstName.trim()) {
        toast.error("Please enter your first name");
        return;
      }
      if (!lastName.trim()) {
        toast.error("Please enter your last name");
        return;
      }
    }
    
    if (currentStep === 1) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address");
        return;
      }
      if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
        toast.error("Please enter a valid phone number");
        return;
      }
    }
    
    if (currentStep === 2) {
      if (!address.trim()) {
        toast.error("Please enter your address");
        return;
      }
    }
    
    // Skills step validation - not strictly required but we encourage at least one
    if (currentStep === 4 && skills.length === 0) {
      const confirmContinue = window.confirm("You haven't selected any skills. Are you sure you want to continue without adding skills?");
      if (!confirmContinue) {
        return;
      }
    }
    
    // If we're on the last step, submit the form
    if (currentStep === steps.length - 1) {
      handleSubmit();
      return;
    }
    
    // Otherwise, go to the next step
    setCurrentStep(currentStep + 1);
  };
  
  // Handle back button click
  const handleBack = () => {
    if (currentStep === 0) {
      // First step, close the dialog
      onOpenChange(false);
    } else {
      // Go back one step
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to complete onboarding");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare display name from first and last name
      const displayName = `${firstName} ${lastName}`;
      
      // Upload profile photo if available
      let avatarUrl = null;
      if (profilePhoto) {
        const fileExt = profilePhoto.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        // Upload the file
        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, profilePhoto);
          
        if (uploadError) {
          throw new Error(`Error uploading profile photo: ${uploadError.message}`);
        }
        
        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath);
          
        avatarUrl = publicUrlData.publicUrl;
      }
      
      // Update user profile
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          phone_number: phone,
          address: address,
          avatar_url: avatarUrl || undefined,
          skills: skills.length > 0 ? skills : null,
          completed_onboarding: true
        })
        .eq('id', user.id);
        
      if (error) {
        throw new Error(`Error updating profile: ${error.message}`);
      }
      
      // Show success message
      setIsComplete(true);
      toast.success("Your profile has been updated!");
      
      // Redirect after a short delay
      setTimeout(() => {
        onOpenChange(false);
        navigate("/home");
      }, 2000);
      
    } catch (error) {
      console.error("Error during onboarding:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get current step data
  const currentStepData = steps[currentStep];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
        {/* Show success state when complete */}
        {isComplete ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-xl font-bold text-center">Onboarding Complete!</h2>
            <p className="text-center text-muted-foreground mt-2">
              Welcome to your neighborhood community!
            </p>
          </div>
        ) : (
          <>
            {/* Step Header */}
            <SurveyStepHeader
              title={currentStepData.title}
              description={currentStepData.description}
            />
            
            {/* Step Content */}
            <div className="py-4">
              {currentStepData.component}
            </div>
            
            {/* Progress Indicator */}
            <SurveyProgress 
              currentStep={currentStep} 
              totalSteps={steps.length} 
            />
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                {currentStep === 0 ? "Cancel" : "Back"}
              </Button>
              
              <Button 
                onClick={handleNext}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Saving...
                  </>
                ) : currentStep === steps.length - 1 ? (
                  "Complete"
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SurveyDialog;
