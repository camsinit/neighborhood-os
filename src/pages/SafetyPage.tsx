
import { useEffect } from "react";
import SafetyUpdates from "@/components/SafetyUpdates";
import { useToast } from "@/components/ui/use-toast";
import { createHighlightListener } from "@/utils/highlightNavigation";
import ModuleLayout from "@/components/layout/ModuleLayout";

/**
 * SafetyPage - Main page for viewing and creating updates
 * 
 * This page displays community updates and allows users to:
 * - View all updates
 * - Create new updates via the button next to the search box
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
    <ModuleLayout
      title="Updates"
      themeColor="safety"
      description="Stay informed about important updates in your community. Share information, receive alerts, and work together to maintain a secure neighborhood environment."
    >
      <SafetyUpdates />
    </ModuleLayout>
  );
};

export default SafetyPage;
