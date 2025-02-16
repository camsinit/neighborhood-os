
import { useSupportRequests } from "@/utils/queries/useSupportRequests";
import { transformRequest } from "@/utils/supportRequestTransformer";
import { useState } from "react";
import MutualSupportContent from "@/components/mutual-support/MutualSupportContent";
import AddSupportRequestDialog from "@/components/AddSupportRequestDialog";
import SupportRequestDialog from "@/components/support/SupportRequestDialog";
import { Button } from "@/components/ui/button";
import { Package, Gift } from "lucide-react";

const GoodsPage = () => {
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [initialRequestType, setInitialRequestType] = useState<"need" | "offer" | null>(null);
  const { data: requests, isLoading } = useSupportRequests();

  const goodsRequests = requests?.filter(req => req.category === 'goods') || [];

  const needs = goodsRequests
    .filter(req => req.request_type === 'need')
    .map(transformRequest);
    
  const offers = goodsRequests
    .filter(req => req.request_type === 'offer')
    .map(transformRequest);

  const handleAddRequest = (type: "need" | "offer") => {
    setInitialRequestType(type);
    setIsAddRequestOpen(true);
  };

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Goods Exchange</h2>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => handleAddRequest("need")}
                  variant="outline"
                  className="bg-white hover:bg-gray-50"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Request Item
                </Button>
                <Button 
                  onClick={() => handleAddRequest("offer")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Share Item
                </Button>
              </div>
            </div>
            
            <div className="bg-blue-100 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                Share items you no longer need or request items you're looking for. Help reduce waste and strengthen our community through sharing.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <MutualSupportContent 
              isLoading={isLoading}
              needs={needs}
              offers={offers}
              onItemClick={(item) => setSelectedRequest(item.originalRequest)}
              onAddRequest={handleAddRequest}
              selectedView="goods"
            />
          </div>
        </div>
      </div>

      <AddSupportRequestDialog 
        open={isAddRequestOpen}
        onOpenChange={setIsAddRequestOpen}
        initialRequestType={initialRequestType}
      />
      
      <SupportRequestDialog
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
      />
    </div>
  );
};

export default GoodsPage;
