import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { createLogger } from "@/utils/logger"; // Import logger

// Create a logger for this component
const logger = createLogger("useSurveyForm");

/**
 * Custom hook to manage survey form state and submission
 * 
 * This hook centralizes the state management for all survey steps
 * and handles submission of the completed survey data to Supabase
 */
export const useSurveyForm = (onComplete: () => void) => {
  const navigate = useNavigate();
  const user = useUser();
  
  // Form state for all steps
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

  // Log current step state whenever it changes
  console.log("[DEBUG] Current step:", currentStep);
  
  // Handle next step button click
  const handleNext = () => {
    console.log("[DEBUG] handleNext called, current step:", currentStep);
    
    // Validate current step before proceeding
    if (currentStep === 0) {
      console.log("[DEBUG] Validating step 0 - Basic Info", { firstName, lastName });
      if (!firstName.trim()) {
        console.log("[DEBUG] First name validation failed");
        toast.error("Please enter your first name");
        return;
      }
      if (!lastName.trim()) {
        console.log("[DEBUG] Last name validation failed");
        toast.error("Please enter your last name");
        return;
      }
      console.log("[DEBUG] Basic info validation passed");
    }
    
    if (currentStep === 1) {
      console.log("[DEBUG] Validating step 1 - Contact Info", { email, phone });
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log("[DEBUG] Email validation failed");
        toast.error("Please enter a valid email address");
        return;
      }
      if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
        console.log("[DEBUG] Phone validation failed");
        toast.error("Please enter a valid phone number");
        return;
      }
      console.log("[DEBUG] Contact info validation passed");
    }
    
    if (currentStep === 2) {
      console.log("[DEBUG] Validating step 2 - Address", { address });
      if (!address.trim()) {
        console.log("[DEBUG] Address validation failed");
        toast.error("Please enter your address");
        return;
      }
      console.log("[DEBUG] Address validation passed");
    }
    
    if (currentStep === 3) {
      console.log("[DEBUG] Validating step 3 - Profile photo", { profilePhoto });
      if (!profilePhoto && !photoUrl) {
        console.log("[DEBUG] Profile photo validation failed");
        toast.error("Please upload a profile photo");
        return;
      }
      console.log("[DEBUG] Profile photo validation passed");
    }
    
    // Skills step validation - not strictly required but we encourage at least one
    if (currentStep === 4 && skills.length === 0) {
      console.log("[DEBUG] Skills step - no skills selected, asking for confirmation");
      const confirmContinue = window.confirm("You haven't selected any skills. Are you sure you want to continue without adding skills?");
      if (!confirmContinue) {
        console.log("[DEBUG] User chose not to continue without skills");
        return;
      }
      console.log("[DEBUG] User confirmed continuing without skills");
    }
    
    // If we're on the last step, submit the form
    if (currentStep === 4) { // Assuming there are 5 steps (0-4)
      console.log("[DEBUG] On last step, submitting form");
      handleSubmit();
      return;
    }
    
    // Otherwise, go to the next step
    console.log("[DEBUG] Advancing to next step:", currentStep + 1);
    setCurrentStep(prevStep => {
      console.log("[DEBUG] Setting current step from", prevStep, "to", prevStep + 1);
      return prevStep + 1;
    });
  };
  
  // Handle back button click
  const handleBack = (onOpenChange: (open: boolean) => void) => {
    console.log("[DEBUG] handleBack called, current step:", currentStep);
    if (currentStep === 0) {
      // First step, close the dialog
      console.log("[DEBUG] On first step, closing dialog");
      onOpenChange(false);
    } else {
      // Go back one step
      console.log("[DEBUG] Going back to previous step:", currentStep - 1);
      setCurrentStep(prevStep => {
        console.log("[DEBUG] Setting current step from", prevStep, "to", prevStep - 1);
        return prevStep - 1;
      });
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
      
      // Call onComplete callback
      onComplete();
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate("/home");
      }, 2000);
      
    } catch (error) {
      console.error("Error during onboarding:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    formData: {
      firstName,
      lastName,
      email,
      phone,
      address,
      profilePhoto,
      photoUrl,
      skills
    },
    setters: {
      setFirstName,
      setLastName,
      setEmail,
      setPhone,
      setAddress,
      setProfilePhoto,
      setPhotoUrl,
      setSkills
    },
    surveyState: {
      currentStep,
      isSubmitting,
      isComplete
    },
    actions: {
      handleNext,
      handleBack
    }
  };
};
