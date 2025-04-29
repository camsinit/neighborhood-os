
import GoodsPageContainer from "@/components/goods/GoodsPageContainer";
import { useEffect } from "react";
import { createHighlightListener } from "@/utils/highlightNavigation";
import ModuleLayout from "@/components/layout/ModuleLayout";

/**
 * GoodsPage component
 * 
 * This page allows users to browse, offer, and request items in the community.
 * Using the ModuleLayout for consistent styling across all modules.
 */
const GoodsPage = () => {
  // Add event listener for highlighting goods items
  useEffect(() => {
    const handleHighlightItem = createHighlightListener("goods");
    window.addEventListener('highlightItem', handleHighlightItem as EventListener);
    return () => {
      window.removeEventListener('highlightItem', handleHighlightItem as EventListener);
    };
  }, []);

  return (
    <ModuleLayout
      title="Freebies Exchange"
      themeColor="goods"
      description="Share resources with your neighbors through our community exchange. Offer items you no longer need, or find things you're looking for."
    >
      <GoodsPageContainer />
    </ModuleLayout>
  );
};

export default GoodsPage;
