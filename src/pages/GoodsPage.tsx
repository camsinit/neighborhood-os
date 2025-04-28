
import GoodsPageContainer from "@/components/goods/GoodsPageContainer";
import { useEffect } from "react";
import { createHighlightListener } from "@/utils/highlightNavigation";
import ModuleLayout from "@/components/layout/ModuleLayout";

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
    <ModuleLayout
      title="Goods Exchange"
      themeColor="goods"
      description="Share resources with your neighbors through our community exchange. Offer items you no longer need, or find things you're looking for."
    >
      <GoodsPageContainer />
    </ModuleLayout>
  );
};

export default GoodsPage;
