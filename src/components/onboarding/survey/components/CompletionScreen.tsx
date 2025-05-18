
import { CheckCircle2 } from "lucide-react";

/**
 * CompletionScreen component
 * 
 * Displayed when the user successfully completes the onboarding process
 */
export const CompletionScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
      <h2 className="text-xl font-bold text-center">Onboarding Complete!</h2>
      <p className="text-center text-muted-foreground mt-2">
        Welcome to your neighborhood community!
      </p>
    </div>
  );
};
