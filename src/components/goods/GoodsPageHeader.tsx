
import { Button } from "@/components/ui/button";
import { Package, AlertCircle } from "lucide-react";

/**
 * Component for the intro section of the Goods page
 * 
 * Contains the page title, an explanation card that describes
 * the purpose of the goods exchange feature, and action buttons
 */
interface GoodsPageHeaderProps {
  onAddOffer: () => void;
  onAddRequest: () => void;
}

const GoodsPageHeader = ({ onAddOffer, onAddRequest }: GoodsPageHeaderProps) => {
  return (
    <div className="rounded-lg p-6 mb-6" 
         style={{ background: "linear-gradient(90deg, hsla(24, 100%, 83%, 1) 0%, hsla(341, 91%, 68%, 1) 100%)" }}>
      <h2 className="text-2xl font-bold text-white">Goods Exchange</h2>
      
      {/* Introduction card - Explains the purpose of this page */}
      <p className="text-white/90 mt-2 mb-4">
        Share and request items within your community. From tools to furniture, 
        connect with neighbors to give, receive, or borrow what you need.
      </p>
      
      {/* Action buttons */}
      <div className="flex gap-2 mt-4">
        <Button 
          onClick={onAddRequest}
          className="bg-white/90 hover:bg-white text-gray-900"
        >
          <AlertCircle className="h-5 w-5 mr-2" />
          Request Item
        </Button>
        <Button 
          onClick={onAddOffer}
          className="bg-white/90 hover:bg-white text-gray-900"
        >
          <Package className="h-5 w-5 mr-2" />
          Share Item
        </Button>
      </div>
    </div>
  );
};

export default GoodsPageHeader;
