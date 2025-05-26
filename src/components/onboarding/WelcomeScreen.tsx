
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Confetti, ConfettiRef } from "@/components/ui/confetti";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { PartyPopper, Sparkles, Users, Gift, Shield } from "lucide-react";

/**
 * WelcomeScreen component
 * 
 * Displays an exciting, colorful welcome message to the user after completing onboarding.
 * Shows confetti animation covering the entire screen.
 * Includes the neighborhood name they're joining with vibrant styling and animations.
 * Condensed version with better space utilization.
 */
interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export const WelcomeScreen = ({ onGetStarted }: WelcomeScreenProps) => {
  // Get the current neighborhood data for personalized welcome message
  const neighborhood = useCurrentNeighborhood();
  const confettiRef = useRef<ConfettiRef>(null);

  // Trigger multiple confetti effects when component mounts
  useEffect(() => {
    // Initial burst from top
    const timer1 = setTimeout(() => {
      confettiRef.current?.fire({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.1 },
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'],
      });
    }, 200);

    // Second burst from left
    const timer2 = setTimeout(() => {
      confettiRef.current?.fire({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
      });
    }, 800);

    // Third burst from right
    const timer3 = setTimeout(() => {
      confettiRef.current?.fire({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#DDA0DD', '#98D8C8', '#FFB6C1', '#87CEEB', '#F0E68C'],
      });
    }, 1400);

    // Continuous gentle rain
    const rainInterval = setInterval(() => {
      confettiRef.current?.fire({
        particleCount: 3,
        spread: 360,
        startVelocity: 15,
        origin: { 
          x: Math.random(),
          y: -0.1 
        },
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
      });
    }, 300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearInterval(rainInterval);
    };
  }, []);

  return (
    <div className="relative">
      {/* Full-screen confetti canvas - positioned to cover entire viewport */}
      <Confetti
        ref={confettiRef}
        className="fixed inset-0 pointer-events-none z-50"
        manualstart={true}
        options={{
          particleCount: 100,
          spread: 70,
          origin: { y: 0.1 },
        }}
      />
      
      {/* Welcome content with condensed layout */}
      <div className="text-center space-y-4 relative z-20 p-4">
        {/* Animated welcome title with gradient */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 animate-bounce">
            <PartyPopper className="h-8 w-8 text-yellow-500 animate-pulse" />
            <Sparkles className="h-6 w-6 text-pink-500 animate-spin" />
            <PartyPopper className="h-8 w-8 text-blue-500 animate-pulse" />
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent animate-fade-in">
            Welcome to {neighborhood?.name || "Your Neighborhood"}!
          </h1>
          
          <p className="text-lg text-gray-700 font-medium animate-fade-in">
            Your profile is all set up and ready to go!
          </p>
        </div>

        {/* Compact community message with condensed grid */}
        <div className="space-y-3 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200 shadow-lg transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-center gap-2">
            <Users className="h-6 w-6 text-blue-600 animate-bounce" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              You're now part of the community!
            </h2>
          </div>
          
          <div className="text-gray-800 space-y-2">
            <p className="font-semibold text-blue-700">Here's what you can do next:</p>
            <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto text-sm">
              <div className="flex items-center gap-2 p-2 bg-white/70 rounded-lg transform hover:scale-105 transition-all duration-200">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Connect with neighbors</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white/70 rounded-lg transform hover:scale-105 transition-all duration-200">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Share and discover skills</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white/70 rounded-lg transform hover:scale-105 transition-all duration-200">
                <Gift className="h-4 w-4 text-green-500" />
                <span className="font-medium">Exchange goods and services</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white/70 rounded-lg transform hover:scale-105 transition-all duration-200">
                <PartyPopper className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Join community events</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white/70 rounded-lg transform hover:scale-105 transition-all duration-200">
                <Shield className="h-4 w-4 text-red-500" />
                <span className="font-medium">Contribute to safety</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compact get started button */}
        <div className="pt-3">
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg font-bold rounded-full shadow-lg transform hover:scale-110 transition-all duration-300 animate-pulse"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Get Started
            <PartyPopper className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
