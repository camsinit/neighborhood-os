
import { useEffect } from "react";
import SafetyUpdates from "@/components/SafetyUpdates";
import { useToast } from "@/components/ui/use-toast";
import GlowingDescriptionBox from "@/components/ui/glowing-description-box";

const SafetyPage = () => {
  const { toast } = useToast();

  useEffect(() => {
    const handleHighlightItem = (e: CustomEvent) => {
      if (e.detail.type === 'safety') {
        // Find and highlight the safety update card
        setTimeout(() => {
          const updateCard = document.querySelector(`[data-safety-id="${e.detail.id}"]`);
          if (updateCard) {
            updateCard.classList.add('rainbow-highlight');
            updateCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Remove highlight after animation
            setTimeout(() => {
              updateCard.classList.remove('rainbow-highlight');
            }, 2000);
          }
        }, 100);
      }
    };

    window.addEventListener('highlightItem', handleHighlightItem as EventListener);
    return () => {
      window.removeEventListener('highlightItem', handleHighlightItem as EventListener);
    };
  }, []);

  return (
    // Wrapper div with relative positioning for the gradient
    <div className="relative min-h-screen">
      {/* 
        Background gradient using the safety-color CSS variable
        The gradient starts with the section color at reduced opacity at the top
        and fades to completely transparent toward the bottom
      */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          background: `linear-gradient(to bottom, hsla(var(--safety-color), 0.15) 0%, hsla(var(--safety-color), 0) 60%)`,
          zIndex: 0 
        }}
        aria-hidden="true"
      />
      
      {/* Content div placed above the gradient background */}
      <div className="relative z-10">
        <div className="min-h-full w-full bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8">
              <h2 className="text-2xl font-bold text-gray-900">Safety Updates</h2>
              
              <GlowingDescriptionBox colorClass="safety-color">
                <p className="text-gray-700 text-sm">
                  Stay informed about safety matters in your community. Share updates, receive alerts, 
                  and work together to maintain a secure neighborhood environment.
                </p>
              </GlowingDescriptionBox>

              <div className="bg-white rounded-lg p-6 shadow-lg">
                <SafetyUpdates />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyPage;
