
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Confetti, ConfettiRef } from "@/components/ui/confetti";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";

/**
 * WelcomeScreen component
 * 
 * Displays a welcome message to the user after completing onboarding.
 * Shows confetti animation originating from the top of the dialog.
 * Includes the neighborhood name they're joining.
 */
interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export const WelcomeScreen = ({ onGetStarted }: WelcomeScreenProps) => {
  // Get the current neighborhood data for personalized welcome message
  const { neighborhood } = useCurrentNeighborhood();
  const confettiRef = useRef<ConfettiRef>(null);

  // Trigger confetti effect when component mounts
  useEffect(() => {
    // Small delay to ensure the component is fully rendered
    const timer = setTimeout(() => {
      confettiRef.current?.fire({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.1 }, // Start from top 10% of the canvas
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      });
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative">
      {/* Confetti canvas - positioned to cover the entire dialog */}
      <Confetti
        ref={confettiRef}
        className="absolute inset-0 pointer-events-none z-10"
        manualstart={true}
        options={{
          particleCount: 100,
          spread: 70,
          origin: { y: 0.1 }, // Originate from top of the dialog
        }}
      />
      
      {/* Welcome content */}
      <div className="text-center space-y-6 relative z-20">
        {/* Welcome title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            🎉 Welcome to {neighborhood?.name || "Your Neighborhood"}!
          </h1>
          <p className="text-lg text-gray-600">
            Your profile is all set up and ready to go.
          </p>
        </div>

        {/* Welcome message */}
        <div className="space-y-4 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900">
            You're now part of the community!
          </h2>
          <div className="text-blue-800 space-y-2">
            <p>Here's what you can do next:</p>
            <ul className="text-left space-y-1 max-w-md mx-auto">
              <li>• Connect with your neighbors</li>
              <li>• Share and discover skills</li>
              <li>• Exchange goods and services</li>
              <li>• Stay updated on community events</li>
              <li>• Contribute to neighborhood safety</li>
            </ul>
          </div>
        </div>

        {/* Get started button */}
        <div className="pt-4">
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};
