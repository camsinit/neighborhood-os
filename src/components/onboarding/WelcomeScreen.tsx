
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Confetti, ConfettiRef } from "@/components/ui/confetti";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { PartyPopper, Sparkles, Heart, Users, Gift, Shield } from "lucide-react";

/**
 * WelcomeScreen component
 * 
 * Displays an exciting, colorful welcome message to the user after completing onboarding.
 * Shows confetti animation covering the entire screen.
 * Includes the neighborhood name they're joining with vibrant styling and animations.
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
      
      {/* Welcome content with vibrant styling */}
      <div className="text-center space-y-8 relative z-20 p-6">
        {/* Animated welcome title with gradient and party popper */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 animate-bounce">
            <PartyPopper className="h-12 w-12 text-yellow-500 animate-pulse" />
            <Sparkles className="h-8 w-8 text-pink-500 animate-spin" />
            <PartyPopper className="h-12 w-12 text-blue-500 animate-pulse" />
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent animate-fade-in">
            Welcome to {neighborhood?.name || "Your Neighborhood"}!
          </h1>
          
          <div className="flex items-center justify-center gap-2">
            <Heart className="h-6 w-6 text-red-500 animate-pulse" />
            <p className="text-xl text-gray-700 font-medium animate-fade-in">
              Your profile is all set up and ready to go!
            </p>
            <Heart className="h-6 w-6 text-red-500 animate-pulse" />
          </div>
        </div>

        {/* Exciting community message with gradient background */}
        <div className="space-y-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200 shadow-lg transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-center gap-3">
            <Users className="h-8 w-8 text-blue-600 animate-bounce" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              You're now part of the community!
            </h2>
            <Users className="h-8 w-8 text-purple-600 animate-bounce" />
          </div>
          
          <div className="text-gray-800 space-y-4">
            <p className="text-lg font-semibold text-blue-700">Here's what amazing things you can do next:</p>
            <div className="grid grid-cols-1 gap-3 max-w-lg mx-auto">
              <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg transform hover:scale-105 transition-all duration-200">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Connect with your neighbors</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg transform hover:scale-105 transition-all duration-200">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Share and discover skills</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg transform hover:scale-105 transition-all duration-200">
                <Gift className="h-5 w-5 text-green-500" />
                <span className="font-medium">Exchange goods and services</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg transform hover:scale-105 transition-all duration-200">
                <PartyPopper className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Join community events</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg transform hover:scale-105 transition-all duration-200">
                <Shield className="h-5 w-5 text-red-500" />
                <span className="font-medium">Contribute to neighborhood safety</span>
              </div>
            </div>
          </div>
        </div>

        {/* Exciting get started button */}
        <div className="pt-6">
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 text-lg font-bold rounded-full shadow-lg transform hover:scale-110 transition-all duration-300 animate-pulse"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Get Started
            <PartyPopper className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
