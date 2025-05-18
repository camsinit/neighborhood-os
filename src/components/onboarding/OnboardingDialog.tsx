
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import SurveyDialog from "./SurveyDialog";
import { Loader2 } from "lucide-react";

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * OnboardingDialog Component
 * 
 * This component renders a modal dialog for the user onboarding process.
 * It checks if the user needs to go through onboarding and redirects them
 * accordingly. If they already completed onboarding, it redirects them to home.
 */
const OnboardingDialog = ({ open, onOpenChange }: OnboardingDialogProps) => {
  const navigate = useNavigate();
  const user = useUser();
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  // Check if the user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        // If no user is logged in, redirect to login page
        navigate("/login");
        return;
      }

      try {
        // Check if the user has completed onboarding
        const { data, error } = await supabase
          .from("profiles")
          .select("completed_onboarding")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error checking onboarding status:", error);
          setHasCompletedOnboarding(false);
        } else {
          setHasCompletedOnboarding(data?.completed_onboarding || false);
          
          // If they've already completed onboarding, redirect to home
          if (data?.completed_onboarding) {
            navigate("/home");
          }
        }
      } catch (err) {
        console.error("Failed to check onboarding status:", err);
        setHasCompletedOnboarding(false);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user, navigate]);

  // Show loading state while checking onboarding status
  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-center text-muted-foreground">
              Loading your profile...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If onboarding is complete, the useEffect will have redirected
  // If still here, show the survey
  return <SurveyDialog open={open} onOpenChange={onOpenChange} />;
};

export default OnboardingDialog;
