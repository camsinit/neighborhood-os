
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
 * 
 * We've ensured the background gradient is properly applied with CSS variables
 * and z-index management to make sure it shows beneath the content.
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
    // Wrapper div with relative positioning for the gradient
    <div className="relative min-h-screen">
      {/* 
        Background gradient using the goods-color CSS variable
        The gradient starts with the section color at reduced opacity at the top
        and fades to completely transparent toward the bottom
        
        We ensure z-index is explicitly set to 0 to position behind content
      */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          background: `linear-gradient(to bottom, hsla(var(--goods-color), 0.15) 0%, hsla(var(--goods-color), 0) 60%)`,
          zIndex: 0 
        }}
        aria-hidden="true"
      />
      
      {/* Content div placed above the gradient background with explicit z-index */}
      <div className="relative z-10">
        <GoodsPageContainer />
      </div>
    </div>
  );
};

export default GoodsPage;
