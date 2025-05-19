
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";

/**
 * WaitlistForm component
 * 
 * This component renders an enhanced form for users to join the waitlist
 * using the animated PlaceholdersAndVanishInput component.
 */
const WaitlistForm = () => {
  // State to track the email input value
  const [email, setEmail] = useState("");
  // State to track loading status during submission
  const [isLoading, setIsLoading] = useState(false);
  // State to track if form was successfully submitted
  const [isSubmitted, setIsSubmitted] = useState(false);
  // Get toast notification function
  const { toast } = useToast();

  // Placeholder suggestions for the input field
  const placeholders = [
    "Enter your email to join the waitlist",
    "Get early access to neighborhoodOS",
    "Be the first to know when we launch",
    "Connect with your neighbors",
    "Join our community of neighbors",
  ];

  /**
   * Handle email input changes
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  /**
   * Handle form submission
   * Submits the email to the waitlist via the Edge Function
   */
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent default form submission behavior
    e.preventDefault();
    
    // Don't proceed if already processing a submission
    if (isLoading) return;
    
    // Validate email before submission
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    // Set loading state to true while processing
    setIsLoading(true);
    
    try {
      console.log("Submitting email to waitlist:", email);
      
      // Call the join-waitlist Edge Function
      const { data, error } = await supabase.functions.invoke("join-waitlist", {
        body: { email },
      });
      
      // If there was an error calling the function
      if (error) {
        console.error("Error calling join-waitlist function:", error);
        throw new Error("Failed to join waitlist. Please try again.");
      }
      
      console.log("Response from join-waitlist function:", data);
      
      // Check if the request was successful based on the response
      if (!data.success) {
        console.error("Function reported error:", data.error);
        throw new Error(data.error || "Failed to join waitlist");
      }
      
      // Show success message with updated text
      toast({
        title: "We'll be in touch!",
        description: "You've been added to our waitlist. Thank you for your interest!",
      });
      
      // Clear the email input
      setEmail("");
      // Set the form as submitted to show confirmation message
      setIsSubmitted(true);
      
    } catch (error: any) {
      // Show error message
      console.error("Waitlist submission error:", error);
      toast({
        title: "Something went wrong",
        description: error.message || "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  return (
    // Container for the entire form with the badge
    <div className="w-full max-w-[600px] mx-auto">
      {/* Banner announcing invite rollout */}
      <div className="w-full text-center mb-2">
        <Badge 
          variant="outline" 
          className="py-1 px-3 bg-gradient-to-r from-blue-100 to-purple-100 text-primary animate-pulse border-primary/30"
        >
          Invites rolling out May 1
        </Badge>
      </div>
      
      {/* If submitted, show confirmation message. Otherwise, show enhanced input */}
      {isSubmitted ? (
        <div className="w-full flex justify-center">
          <div className="text-center py-3 px-6 rounded-full border border-green-200 bg-green-50 text-green-700 font-medium">
            We'll be in touch!
          </div>
        </div>
      ) : (
        <PlaceholdersAndVanishInput 
          placeholders={placeholders}
          onChange={handleEmailChange}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default WaitlistForm;
