
import { useEffect } from "react";
import SafetyUpdates from "@/components/SafetyUpdates";
import { useToast } from "@/components/ui/use-toast";
import GlowingDescriptionBox from "@/components/ui/glowing-description-box";
import { Button } from "@/components/ui/button"; // Import Button
import { Shield } from "lucide-react"; // Import Shield icon
import { useState } from "react"; // Import useState
import AddSafetyUpdateDialogNew from "@/components/safety/AddSafetyUpdateDialogNew"; // Import new dialog

/**
 * SafetyPage - Main page for viewing and creating safety updates
 * 
 * This page displays community safety updates and allows users to:
 * - View all safety updates
 * - Create new safety updates
 * - View detailed information about each update
 */
const SafetyPage = () => {
  // State for controlling the new safety update dialog
  const [isAddUpdateOpen, setIsAddUpdateOpen] = useState(false);
  const { toast } = useToast();

  // Handle highlighting of safety items when navigated to directly
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
              {/* Header section with title and action button */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Safety Updates</h2>
                
                {/* Add New Update Button */}
                <Button 
                  onClick={() => setIsAddUpdateOpen(true)}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  New Update
                </Button>
              </div>
              
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
      
      {/* New Safety Update Dialog */}
      <AddSafetyUpdateDialogNew 
        open={isAddUpdateOpen}
        onOpenChange={setIsAddUpdateOpen}
      />
    </div>
  );
};

export default SafetyPage;
