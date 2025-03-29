
import { useState } from "react";
import OnboardingDialog from "@/components/onboarding/OnboardingDialog";
import SurveyDialog from "@/components/onboarding/SurveyDialog";

/**
 * A hidden test button component that allows triggering onboarding flow
 * Simplified for clarity
 */
const SecretTestButton = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowOnboarding(true)}
        className="fixed bottom-4 left-4 w-4 h-4 opacity-0 hover:opacity-100 transition-opacity duration-200"
        aria-label="Test onboarding"
      />
      <OnboardingDialog 
        open={showOnboarding} 
        onOpenChange={(open) => {
          setShowOnboarding(open);
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

export default SecretTestButton;
