
import { Button } from "@/components/ui/button";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { Sparkles } from "lucide-react";

/**
 * WelcomeScreen component
 * 
 * A minimalist welcome screen that displays after completing onboarding.
 * Features simple, clean messaging without visual clutter.
 * Now dynamically references the specific neighborhood the user is joining.
 */
interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export const WelcomeScreen = ({ onGetStarted }: WelcomeScreenProps) => {
  // Get the current neighborhood data for personalized welcome message
  const neighborhood = useCurrentNeighborhood();

  return (
    <div className="relative">
      {/* Minimalist welcome content */}
      <div className="text-center space-y-6 p-6">
        {/* Simple welcome title */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to {neighborhood?.name || "Your Neighborhood"}!
          </h1>
          
          <p className="text-gray-600">
            You're now part of the {neighborhood?.name || "neighborhood"} community! 
            Your profile is complete and you're ready to connect with your neighbors.
          </p>
        </div>

        {/* Clean action button */}
        <div className="pt-4">
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};
