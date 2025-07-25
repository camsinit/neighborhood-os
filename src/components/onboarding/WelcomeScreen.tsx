
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Confetti, ConfettiRef } from "@/components/ui/confetti";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { Sparkles } from "lucide-react";

/**
 * WelcomeScreen component
 * 
 * A minimalist welcome screen that displays after completing onboarding.
 * Features simple, clean messaging with confetti animation from the top.
 * Focuses on essential information without visual clutter.
 * Now dynamically references the specific neighborhood the user is joining.
 */
interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export const WelcomeScreen = ({ onGetStarted }: WelcomeScreenProps) => {
  // Get the current neighborhood data for personalized welcome message
  const neighborhood = useCurrentNeighborhood();
  const confettiRef = useRef<ConfettiRef>(null);

  // Trigger confetti effects when component mounts
  useEffect(() => {
    // Initial burst from top
    const timer1 = setTimeout(() => {
      confettiRef.current?.fire({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.1 },
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
      });
    }, 300);

    // Gentle continuous rain from top
    const rainInterval = setInterval(() => {
      confettiRef.current?.fire({
        particleCount: 2,
        spread: 360,
        startVelocity: 15,
        origin: { 
          x: Math.random(),
          y: -0.1 
        },
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
      });
    }, 400);

    return () => {
      clearTimeout(timer1);
      clearInterval(rainInterval);
    };
  }, []);

  return (
    <div className="relative">
      {/* Full-screen confetti canvas - positioned behind the welcome card */}
      <Confetti
        ref={confettiRef}
        className="fixed inset-0 pointer-events-none z-10"
        manualstart={true}
        options={{
          particleCount: 100,
          spread: 70,
          origin: { y: 0.1 },
        }}
      />
      
    </div>
  );
};
