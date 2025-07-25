import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Confetti, ConfettiRef } from "@/components/ui/confetti";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { useNeighborhoodMembers } from "@/hooks/useNeighborhoodMembers";
import { Sparkles, Users } from "lucide-react";

/**
 * WelcomePopover component
 * 
 * A centered popover that appears over the dashboard after completing onboarding.
 * Features confetti animation, backdrop blur, and dismissible via button or outside click.
 * Shows a welcome message specific to the neighborhood the user just joined.
 */
interface WelcomePopoverProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export const WelcomePopover = ({ isVisible, onDismiss }: WelcomePopoverProps) => {
  // Get the current neighborhood data for personalized welcome message
  const neighborhood = useCurrentNeighborhood();
  
  // Get neighborhood members to show profile photos in the button
  const { data: members } = useNeighborhoodMembers();
  
  const confettiRef = useRef<ConfettiRef>(null);

  // Trigger confetti effects when component becomes visible
  useEffect(() => {
    if (!isVisible) return;

    // Initial burst from center-top
    const timer1 = setTimeout(() => {
      confettiRef.current?.fire({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.2, x: 0.5 },
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
      });
    }, 300);

    // Gentle continuous rain from various points
    const rainInterval = setInterval(() => {
      confettiRef.current?.fire({
        particleCount: 3,
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
  }, [isVisible]);

  // Handle clicking outside the popover to dismiss
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only dismiss if clicking the backdrop itself, not the popover content
    if (e.target === e.currentTarget) {
      onDismiss();
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Full-screen confetti canvas */}
      <Confetti
        ref={confettiRef}
        className="fixed inset-0 pointer-events-none z-50"
        manualstart={true}
        options={{
          particleCount: 150,
          spread: 70,
          origin: { y: 0.2 },
        }}
      />

      {/* Backdrop with blur effect - more white, less gray for better confetti visibility */}
      <div 
        className="fixed inset-0 bg-white/40 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-fade-in"
        onClick={handleBackdropClick}
        style={{ animationDelay: '0.1s' }}
      >
        {/* Welcome popover card - enhanced entrance animation */}
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative animate-scale-in overflow-hidden"
          style={{ 
            animationDelay: '0.2s',
            animationDuration: '0.4s',
            animationFillMode: 'both'
          }}
        >
          {/* Neighborhood Cover Photo Header */}
          {neighborhood?.invite_header_image_url && (
            <div className="w-full h-32 overflow-hidden">
              <img 
                src={neighborhood.invite_header_image_url} 
                alt={`${neighborhood.name} neighborhood`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Welcome content */}
          <div className="p-8 text-center space-y-6">
            {/* Welcome title */}
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome to {neighborhood?.name || "Your Neighborhood"}!
              </h1>
              
              <p className="text-gray-600 leading-relaxed">
                You're now part of the {neighborhood?.name || "neighborhood"} community! 
                Your profile is complete and you're ready to connect with your neighbors.
              </p>
            </div>

            {/* Action button with neighbor avatars */}
            <div className="pt-4">
              <Button 
                onClick={onDismiss}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center gap-3"
              >
                <Sparkles className="h-4 w-4" />
                Join your neighbors
                
                {/* Overlapping neighbor profile photos */}
                {members && members.length > 0 && (
                  <div className="flex -space-x-2 ml-2">
                    {members.slice(0, 3).map((member, index) => (
                      <Avatar key={member.user_id} className="h-6 w-6 border-2 border-white">
                        <AvatarImage src={member.avatar_url || ''} />
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                          <Users className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};