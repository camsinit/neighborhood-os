
/**
 * OnboardingPage component
 * 
 * This page handles the user onboarding flow, guiding them through 
 * a series of steps to complete their profile setup.
 * 
 * UPDATED: Now supports guest onboarding mode for unauthenticated users
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
  const [isGuestMode, setIsGuestMode] = useState(false);
  
  // Get the current user
  const user = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check onboarding status for both guest and regular users
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      console.log("[OnboardingPage] Checking onboarding status");
      console.log("[OnboardingPage] User:", user ? `${user.id} (${user.email})` : 'null');
      
      // First check if we're in guest mode
      const guestData = localStorage.getItem('guestOnboarding');
      const isGuest = !!guestData;
      
      console.log("[OnboardingPage] Guest mode:", isGuest);
      console.log("[OnboardingPage] Guest data:", guestData);
      
      setIsGuestMode(isGuest);
      
      // If we're in guest mode, allow onboarding without authentication
      if (isGuest) {
        console.log("[OnboardingPage] Guest mode detected - allowing onboarding");
        setNeedsOnboarding(true);
        setLoading(false);
        return;
      }
      
      // Regular flow - check if user is authenticated
      if (!user?.id) {
        console.log("[OnboardingPage] No user and not in guest mode - redirecting to login");
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
          .single();
        
        if (error) throw error;
        
        // If onboarding is complete, redirect to home
        if (data?.completed_onboarding) {
          console.log("[OnboardingPage] User has completed onboarding - redirecting to home");
          setNeedsOnboarding(false);
          navigate("/home");
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
            {isGuestMode ? "Setting up your account..." : "Setting up your profile..."}
          </p>
        </div>
      </div>
    );
  }
  
  // Display onboarding dialog
  console.log("[OnboardingPage] Rendering onboarding dialog");
  console.log("[OnboardingPage] Guest mode:", isGuestMode);
  console.log("[OnboardingPage] Needs onboarding:", needsOnboarding);
  
  return (
    <OnboardingDialog 
      open={needsOnboarding} 
      onOpenChange={(open) => {
        if (!open) {
          // If closing dialog, navigate based on mode
          if (isGuestMode) {
            // For guest mode, they should be logged in after completion
            navigate("/home");
          } else {
            navigate("/home");
          }
        }
      }}
    />
  );
};

export default OnboardingPage;
