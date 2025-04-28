
import FreebiesPageContainer from "@/components/freebies/FreebiesPageContainer";
import { useEffect } from "react";
import { createHighlightListener } from "@/utils/highlightNavigation";
import ModuleLayout from "@/components/layout/ModuleLayout";

/**
 * FreebiesPage component
 * 
 * This page allows users to browse, offer, and request free items in the community.
 * Using the ModuleLayout for consistent styling across all modules.
 */
const FreebiesPage = () => {
  // Add event listener for highlighting freebies items
  useEffect(() => {
    const handleHighlightItem = createHighlightListener("freebies");
    window.addEventListener('highlightItem', handleHighlightItem as EventListener);
    return () => {
      window.removeEventListener('highlightItem', handleHighlightItem as EventListener);
    };
  }, []);

  return (
    <ModuleLayout
      title="Freebies Exchange"
      themeColor="freebies"
      description="Share resources with your neighbors through our community exchange. Offer items you no longer need, or find things you're looking for."
    >
      <FreebiesPageContainer />
    </ModuleLayout>
  );
};

export default FreebiesPage;
