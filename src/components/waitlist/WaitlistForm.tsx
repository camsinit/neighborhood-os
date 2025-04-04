
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { StarBorder } from "@/components/ui/star-border"; // Import the StarBorder component
import { Badge } from "@/components/ui/badge"; // Import Badge for the banner

/**
 * WaitlistForm component
 * 
 * This component renders a form for users to join the waitlist
 * by submitting their email address. It uses the StarBorder component
 * for a more decorative, animated appearance.
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
    <div className="flex flex-col items-center">
      {/* Banner announcing invite rollout */}
      <Badge 
        variant="outline" 
        className="mb-2 py-1 px-3 bg-gradient-to-r from-blue-100 to-purple-100 text-primary animate-pulse border-primary/30"
      >
        Invites rolling out May 1
      </Badge>
      
      {/* Wrap the form with the StarBorder component - increased width by another 100px from 500px to 600px */}
      <StarBorder as="div" className="w-full max-w-[600px]">
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2 sm:flex-row">
          {/* If submitted, show confirmation message. Otherwise, show email input field */}
          {isSubmitted ? (
            // Confirmation message displayed in place of the input
            <div className="flex-grow py-2 px-4 text-center text-primary font-medium">
              We'll be in touch!
            </div>
          ) : (
            // Email input field with rounded corners
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-grow rounded-full" // Oval shape for the input
              disabled={isLoading}
              aria-label="Email for waitlist"
            />
          )}
          
          {/* Submit button with rounded corners - hidden after successful submission */}
          {!isSubmitted && (
            <Button 
              type="submit" 
              disabled={isLoading}
              className="rounded-full" // Oval shape for the button
            >
              {isLoading ? "Joining..." : "Join Waitlist"}
            </Button>
          )}
        </form>
      </StarBorder>
    </div>
  );
};

export default WaitlistForm;
