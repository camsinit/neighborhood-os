
/**
 * Component for the intro section of the Goods page
 * 
 * Contains just the page title. The description is now handled by
 * the GlowingDescriptionBox in the GoodsPageContainer component.
 */
const GoodsPageHeader = () => {
  return (
    <>
      {/* Just the page title - description is now in GoodsPageContainer */}
      <h2 className="text-2xl font-bold text-gray-900">Goods</h2>
    </>
  );
};

export default GoodsPageHeader;
