/**
 * OnboardingPage component
 * 
 * This page handles the user onboarding flow, guiding them through 
 * a series of steps to complete their profile setup.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import OnboardingDialog from "@/components/onboarding/OnboardingDialog";
import { useToast } from "@/components/ui/use-toast";

const OnboardingPage = () => {
  // Track whether onboarding is needed or already completed
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get the current user
  const user = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user?.id) {
        // If no user, redirect to login
        navigate("/login");
        return;
      }
      
      try {
        // Fetch profile data to check onboarding status
        const { data, error } = await supabase
          .from("profiles")
          .select("completed_onboarding")
          .eq("id", user.id)
          .single();
        
        if (error) throw error;
        
        // If onboarding is complete, redirect to home
        if (data?.completed_onboarding) {
          setNeedsOnboarding(false);
          navigate("/home");
        } else {
          // Otherwise show onboarding
          setNeedsOnboarding(true);
        }
      } catch (error: any) {
        console.error("Error checking onboarding status:", error);
        toast({
          title: "Error",
          description: "Unable to check your profile status. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkOnboardingStatus();
  }, [user, navigate, toast]);
  
  // Handle onboarding completion (will be passed to dialog)
  const onOnboardingComplete = async () => {
    try {
      await supabase
        .from("profiles")
        .update({ completed_onboarding: true })
        .eq("id", user?.id);
        
      toast({
        title: "Profile Setup Complete",
        description: "Welcome to your neighborhood dashboard!",
      });
      navigate("/home");
    } catch (error: any) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error",
        description: "Unable to update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Display loading state
  if (loading || needsOnboarding === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-center">
          <p className="text-lg text-gray-600">Setting up your profile...</p>
        </div>
      </div>
    );
  }
  
  // Display onboarding dialog
  return (
    <OnboardingDialog 
      open={needsOnboarding} 
      onOpenChange={(open) => {
        if (!open) navigate("/home");
      }}
    />
  );
};

export default OnboardingPage;
