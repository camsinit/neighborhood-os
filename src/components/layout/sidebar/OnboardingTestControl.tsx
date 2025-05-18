
/**
 * OnboardingTestControl component
 * 
 * This component provides testing controls for the onboarding process.
 * It allows developers to reset a user's onboarding status and restart the process.
 */
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

/**
 * Component that adds onboarding testing controls to the diagnostics panel
 */
const OnboardingTestControl = () => {
  // State to track if the reset operation is in progress
  const [isResetting, setIsResetting] = useState(false);
  
  // Get the current user
  const user = useUser();
  
  // For navigation after reset
  const navigate = useNavigate();
  
  /**
   * Reset the user's onboarding status to start over
   */
  const handleResetOnboarding = async () => {
    // Make sure we have a user
    if (!user) {
      toast.error("No user logged in");
      return;
    }
    
    try {
      setIsResetting(true);
      
      // Update the profile to mark onboarding as incomplete
      const { error } = await supabase
        .from('profiles')
        .update({
          completed_onboarding: false,
          // Reset other onboarding fields to empty values
          // This is optional but helps with full reset testing
          display_name: null,
          phone_number: null,
          address: null,
          avatar_url: null,
          skills: null
        })
        .eq('id', user.id);
      
      if (error) {
        throw new Error(`Failed to reset onboarding: ${error.message}`);
      }
      
      toast.success("Onboarding has been reset!");
      
      // Navigate to the onboarding page to start over
      navigate("/onboarding");
      
    } catch (err) {
      console.error("Error resetting onboarding:", err);
      toast.error("Failed to reset onboarding status");
    } finally {
      setIsResetting(false);
    }
  };
  
  /**
   * Jump directly to onboarding without resetting data
   */
  const handleGoToOnboarding = () => {
    navigate("/onboarding");
    toast.info("Opening onboarding experience");
  };
  
  return (
    <div className="mt-2">
      <h6 className="font-medium mb-1 text-xs">Onboarding Testing</h6>
      <div className="space-y-1">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs h-7 bg-gray-50"
          onClick={handleGoToOnboarding}
        >
          Open Onboarding
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs h-7 bg-gray-50 text-amber-600 hover:text-amber-700"
          onClick={handleResetOnboarding}
          disabled={isResetting}
        >
          {isResetting ? "Resetting..." : "Reset Onboarding"}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingTestControl;
