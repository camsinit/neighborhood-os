
import GoodsPageContainer from "@/components/goods/GoodsPageContainer";

/**
 * GoodsPage component
 * 
 * This page allows users to browse, offer, and request items in the community.
 * 
 * The actual implementation has been moved to the GoodsPageContainer component
 * to keep this file clean and focused on routing concerns.
 */
const GoodsPage = () => {
  // Simply render the container component which handles all the logic
  return <GoodsPageContainer />;
};

export default GoodsPage;
