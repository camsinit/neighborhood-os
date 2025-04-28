import GoodsPageContainer from "@/components/goods/GoodsPageContainer";
import { useEffect } from "react";
import { createHighlightListener } from "@/utils/highlightNavigation";

/**
 * GoodsPage component
 * 
 * This page allows users to browse, offer, and request items in the community.
 * 
 * The actual implementation has been moved to the GoodsPageContainer component
 * to keep this file clean and focused on routing concerns.
 */
const GoodsPage = () => {
  // Add event listener for highlighting goods items
  useEffect(() => {
    // Use our utility to create a consistent highlight listener for goods items
    // This will handle finding elements by data-goods-id and applying animations
    const handleHighlightItem = createHighlightListener("goods");
    
    // Add event listener when component mounts
    window.addEventListener('highlightItem', handleHighlightItem as EventListener);
    
    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener('highlightItem', handleHighlightItem as EventListener);
    };
  }, []);

  return (
    <div className="page-gradient goods-gradient">
      <div className="relative z-10">
        <div className="min-h-full w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8">
              <h2 className="text-2xl font-bold text-gray-900">Goods Exchange</h2>
              
              <div className="mt-4 bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100 shadow-sm">
                <p className="text-gray-700 text-sm">
                  Share resources with your neighbors through our community exchange. 
                  Offer items you no longer need, or find things you're looking for.
                </p>
              </div>

              <GoodsPageContainer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoodsPage;
