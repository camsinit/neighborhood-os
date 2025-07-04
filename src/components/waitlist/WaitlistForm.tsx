
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { StarBorder } from "@/components/ui/star-border";
import WaitlistSurveyPopover from "./WaitlistSurveyPopover";

/**
 * WaitlistForm component
 * 
 * Handles email signup for the waitlist with validation and success feedback.
 * After successful signup, triggers a survey popover to collect additional information.
 */
const WaitlistForm = () => {
  // Form state management
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  
  // Toast notifications for user feedback
  const { toast } = useToast();

  /**
   * Handle form submission for waitlist signup
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Submitting waitlist signup for:", email);
      
      // Call the existing join-waitlist edge function
      const { data, error } = await supabase.functions.invoke("join-waitlist", {
        body: { email },
      });

      if (error) {
        console.error("Error joining waitlist:", error);
        throw new Error("Failed to join waitlist");
      }

      console.log("Waitlist signup successful:", data);

      // Show success message
      toast({
        title: "Welcome to the waitlist!",
        description: "Please take a moment to tell us more about yourself.",
      });

      // Store the email and show the survey popover
      setSubmittedEmail(email);
      setShowSurvey(true);
      
      // Clear the form
      setEmail("");

    } catch (error: any) {
      console.error("Waitlist signup error:", error);
      toast({
        title: "Something went wrong",
        description: error.message || "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle survey popover close
   */
  const handleSurveyClose = () => {
    setShowSurvey(false);
    setSubmittedEmail("");
  };

  return (
    <>
      {/* Main waitlist form with special border effects */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="flex-1 h-12 text-base bg-white"
            required
          />
          <StarBorder 
            as="button"
            type="submit" 
            disabled={isSubmitting}
            className="h-12 px-8 text-base font-medium"
            speed="4s"
          >
            {isSubmitting ? "Joining..." : "Join Waitlist"}
          </StarBorder>
        </div>
      </form>

      {/* Survey popover that appears after successful waitlist signup */}
      <WaitlistSurveyPopover
        isOpen={showSurvey}
        onClose={handleSurveyClose}
        userEmail={submittedEmail}
      />
    </>
  );
};

export default WaitlistForm;
