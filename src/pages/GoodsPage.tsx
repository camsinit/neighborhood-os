
import GoodsPageContainer from "@/components/goods/GoodsPageContainer";

/**
 * GoodsPage component
 * 
 * This page allows users to browse, offer, and request items in the community.
 * 
 * The actual implementation has been moved to the GoodsPageContainer component
 * to keep this file clean and focused on routing concerns.
 * 
 * The GlowingDescriptionBox is used in the GoodsPageContainer to maintain
 * consistency with other feature pages.
 */
const GoodsPage = () => {
  return (
    // Wrapper div with relative positioning for the gradient
    <div className="relative min-h-screen">
      {/* 
        Background gradient using the goods-color CSS variable
        The gradient starts with the section color at reduced opacity at the top
        and fades to completely transparent toward the bottom
      */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          background: `linear-gradient(to bottom, hsla(var(--goods-color), 0.15) 0%, hsla(var(--goods-color), 0) 60%)`,
          zIndex: 0 
        }}
        aria-hidden="true"
      />
      
      {/* Content div placed above the gradient background */}
      <div className="relative z-10">
        <GoodsPageContainer />
      </div>
    </div>
  );
};

export default GoodsPage;
