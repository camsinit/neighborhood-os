import { useEffect } from "react";
import SafetyUpdates from "@/components/SafetyUpdates";
import { useToast } from "@/components/ui/use-toast";
import GlowingDescriptionBox from "@/components/ui/glowing-description-box";
import AddSafetyUpdateDialogNew from "@/components/safety/AddSafetyUpdateDialogNew";
import { createHighlightListener } from "@/utils/highlightNavigation";

/**
 * SafetyPage - Main page for viewing and creating safety updates
 * 
 * This page displays community safety updates and allows users to:
 * - View all safety updates
 * - Create new safety updates via the button next to the search box
 * - View detailed information about each update
 */
const SafetyPage = () => {
  const { toast } = useToast();

  // Handle highlighting of safety items when navigated to directly
  useEffect(() => {
    // Use our utility to create a consistent highlight listener for safety items
    // This will handle finding elements by data-safety-id and applying animations
    const handleHighlightItem = createHighlightListener("safety");
    
    // Add event listener when component mounts
    window.addEventListener('highlightItem', handleHighlightItem as EventListener);
    
    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener('highlightItem', handleHighlightItem as EventListener);
    };
  }, []);

  return (
    <div className="page-gradient safety-gradient">
      <div className="relative z-10">
        <div className="min-h-full w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Safety Updates</h2>
              </div>
              
              <GlowingDescriptionBox colorClass="safety-color">
                <p className="text-gray-700 text-sm">
                  Stay informed about safety matters in your community. Share updates, receive alerts, 
                  and work together to maintain a secure neighborhood environment.
                </p>
              </GlowingDescriptionBox>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg mt-6">
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
