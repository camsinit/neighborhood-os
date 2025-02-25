
import { useEffect } from "react";
import SafetyUpdates from "@/components/SafetyUpdates";
import { useToast } from "@/components/ui/use-toast";

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
    <div className="min-h-full w-full bg-gradient-to-b from-[#FDE1D3] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h2 className="text-2xl font-bold text-gray-900">Safety Updates</h2>
          
          <div className="bg-white rounded-lg p-4 mt-2 mb-6 shadow-md">
            <p className="text-gray-700 text-sm">
              Stay informed about safety matters in your community. Share updates, receive alerts, 
              and work together to maintain a secure neighborhood environment.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <SafetyUpdates />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyPage;
