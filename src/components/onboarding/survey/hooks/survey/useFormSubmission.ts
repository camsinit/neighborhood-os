
/**
 * useFormSubmission hook
 * 
 * This hook handles the submission of the survey form data to Supabase.
 */
import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface FormSubmissionProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    profilePhoto: File | null;
    photoUrl: string;
    skills: string[];
  };
  onComplete: () => void;
}

export const useFormSubmission = ({ formData, onComplete }: FormSubmissionProps) => {
  const navigate = useNavigate();
  const user = useUser();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to complete onboarding");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare display name from first and last name
      const displayName = `${formData.firstName} ${formData.lastName}`;
      
      // Upload profile photo if available
      let avatarUrl = null;
      if (formData.profilePhoto) {
        const fileExt = formData.profilePhoto.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        // Upload the file
        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, formData.profilePhoto);
          
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
          phone_number: formData.phone,
          address: formData.address,
          avatar_url: avatarUrl || undefined,
          skills: formData.skills.length > 0 ? formData.skills : null,
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
    submissionState: {
      isSubmitting,
      isComplete
    },
    handleSubmit
  };
};
