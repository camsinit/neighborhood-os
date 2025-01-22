import { useState } from "react";
import OnboardingDialog from "@/components/onboarding/OnboardingDialog";
import SurveyDialog from "@/components/onboarding/SurveyDialog";

interface AuthOnboardingProps {
  showOnboarding: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthOnboarding = ({ showOnboarding, onOpenChange }: AuthOnboardingProps) => {
  const [showSurvey, setShowSurvey] = useState(false);

  return (
    <>
      <OnboardingDialog 
        open={showOnboarding} 
        onOpenChange={(open) => {
          onOpenChange(open);
          if (!open) {
            setShowSurvey(true);
          }
        }}
      />
      <SurveyDialog
        open={showSurvey}
        onOpenChange={setShowSurvey}
      />
    </>
  );
};

export default AuthOnboarding;