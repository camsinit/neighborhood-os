
/**
 * OnboardingPage component
 * 
 * This page handles the user onboarding flow, guiding them through 
 * a series of steps to complete their profile setup.
 * 
 * UPDATED: Simplified to unified onboarding flow for new users
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
  
  // Check onboarding status
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      console.log("[OnboardingPage] Checking onboarding status");
      console.log("[OnboardingPage] User:", user ? `${user.id} (${user.email})` : 'null');
      
      // Check if we have any stored invite or onboarding context
      const pendingInviteCode = localStorage.getItem('pendingInviteCode');
      console.log("[OnboardingPage] Pending invite code:", pendingInviteCode);
      
      // If no user but we have a pending invite, allow onboarding for account creation
      if (!user?.id && pendingInviteCode) {
        console.log("[OnboardingPage] No user but pending invite - allowing onboarding for account creation");
        setNeedsOnboarding(true);
        setLoading(false);
        return;
      }
      
      // If no user and no pending invite, redirect to login
      if (!user?.id) {
        console.log("[OnboardingPage] No user and no pending context - redirecting to login");
        navigate("/login");
        return;
      }
      
      try {
        console.log("[OnboardingPage] Checking onboarding status for authenticated user");
        
        // Fetch profile data to check onboarding status
        const { data, error } = await supabase
          .from("profiles")
          .select("completed_onboarding")
          .eq("id", user.id)
          .maybeSingle();
        
        if (error) {
          console.error("[OnboardingPage] Error checking profile:", error);
          // If profile doesn't exist, user needs onboarding
          setNeedsOnboarding(true);
        } else if (data?.completed_onboarding) {
          console.log("[OnboardingPage] User has completed onboarding - redirecting to dashboard");
          setNeedsOnboarding(false);
          navigate("/dashboard");
        } else {
          console.log("[OnboardingPage] User needs to complete onboarding");
          setNeedsOnboarding(true);
        }
      } catch (error: any) {
        console.error("[OnboardingPage] Error checking onboarding status:", error);
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
  
  // Display loading state
  if (loading || needsOnboarding === null) {
    console.log("[OnboardingPage] Rendering loading state");
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-center">
          <p className="text-lg text-gray-600">
            Setting up your profile...
          </p>
        </div>
      </div>
    );
  }
  
  // Display onboarding dialog
  console.log("[OnboardingPage] Rendering onboarding dialog");
  console.log("[OnboardingPage] Needs onboarding:", needsOnboarding);
  
  return (
    <OnboardingDialog 
      open={needsOnboarding} 
      onOpenChange={(open) => {
        if (!open) {
          navigate("/dashboard");
        }
      }}
    />
  );
};

export default OnboardingPage;
