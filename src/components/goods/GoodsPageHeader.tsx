
/**
 * Component for the intro section of the Goods page
 * 
 * Contains the page title and an explanation card that describes
 * the purpose of the goods exchange feature
 */
const GoodsPageHeader = () => {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900">Goods</h2>
      
      {/* Introduction card - Explains the purpose of this page */}
      <div className="bg-white rounded-lg p-4 mt-2 mb-6 shadow-md">
        <p className="text-gray-700 text-sm">
          Share and request items within your community. From tools to furniture, 
          connect with neighbors to give, receive, or borrow what you need.
        </p>
      </div>
    </>
  );
};

export default GoodsPageHeader;
