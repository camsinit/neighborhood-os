
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { RainbowButton } from "@/components/ui/rainbow-button"; // Import RainbowButton instead of Button
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { StarBorder } from "@/components/ui/star-border"; // Import the new StarBorder component

/**
 * WaitlistForm component
 * 
 * This component renders a form for users to join the waitlist
 * by submitting their email address. It now uses the StarBorder component
 * for a more decorative, animated appearance and the RainbowButton for submission.
 */
const WaitlistForm = () => {
  // State to track the email input value
  const [email, setEmail] = useState("");
  // State to track loading status during submission
  const [isLoading, setIsLoading] = useState(false);
  // Get toast notification function
  const { toast } = useToast();

  /**
   * Handle form submission
   * Submits the email to the waitlist via the Edge Function
   */
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent default form submission behavior
    e.preventDefault();
    
    // Don't proceed if already processing a submission
    if (isLoading) return;
    
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
      
      // Check the response from the function
      if (!data.success) {
        console.error("Function reported error:", data.error);
        throw new Error(data.error || "Failed to join waitlist");
      }
      
      // Show success message
      toast({
        title: "Success!",
        description: "You've been added to our waitlist. We'll be in touch soon!",
      });
      
      // Clear the email input
      setEmail("");
      
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
    // Wrap the form with the StarBorder component
    <StarBorder as="div" className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2 sm:flex-row">
        {/* Email input field with more rounded corners */}
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-grow rounded-full" // Added rounded-full for oval shape
          disabled={isLoading}
          aria-label="Email for waitlist"
        />
        
        {/* Submit button with rainbow effect - now with min-width to prevent text from scrunching */}
        <RainbowButton 
          type="submit" 
          disabled={isLoading}
          className="rounded-full min-w-[140px]" // Added min-width to prevent text from being scrunched
        >
          {isLoading ? "Joining..." : "Join Waitlist"}
        </RainbowButton>
      </form>
    </StarBorder>
  );
};

export default WaitlistForm;
