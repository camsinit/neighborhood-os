import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SurveyData } from "./useWaitlistSurveyForm";

/**
 * Custom hook for handling waitlist survey submission
 */
export const useWaitlistSurveySubmit = (onClose: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  /**
   * Submit the survey data
   */
  const submitSurvey = async (formData: SurveyData) => {
    setIsSubmitting(true);
    try {
      console.log("Submitting waitlist survey:", formData);

      // Call edge function to save survey data
      const { data, error } = await supabase.functions.invoke("save-waitlist-survey", {
        body: formData
      });

      if (error) {
        console.error("Error submitting survey:", error);
        throw new Error("Failed to submit survey");
      }

      console.log("Survey submitted successfully:", data);
      toast({
        title: "Thank you!",
        description: "Your information has been submitted. We'll be in touch soon!"
      });

      // Close the popover
      onClose();
    } catch (error: any) {
      console.error("Survey submission error:", error);
      toast({
        title: "Something went wrong",
        description: error.message || "Failed to submit survey. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitSurvey
  };
};