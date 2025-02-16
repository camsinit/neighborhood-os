
import { useSupportRequests } from "@/utils/queries/useSupportRequests";
import { transformRequest } from "@/utils/supportRequestTransformer";
import { useState } from "react";
import MutualSupportContent from "@/components/mutual-support/MutualSupportContent";
import AddSupportRequestDialog from "@/components/AddSupportRequestDialog";
import SupportRequestDialog from "@/components/support/SupportRequestDialog";
import { Button } from "@/components/ui/button";
import { HeartHandshake } from "lucide-react";

const CarePage = () => {
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [initialRequestType, setInitialRequestType] = useState<"need" | "offer" | null>(null);
  const { data: requests, isLoading } = useSupportRequests();

  const careRequests = requests?.filter(req => req.category === 'care') || [];

  const needs = careRequests
    .filter(req => req.request_type === 'need')
    .map(transformRequest);
    
  const offers = careRequests
    .filter(req => req.request_type === 'offer')
    .map(transformRequest);

  const handleAddRequest = (type: "need" | "offer") => {
    setInitialRequestType(type);
    setIsAddRequestOpen(true);
  };

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-rose-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HeartHandshake className="h-8 w-8 text-rose-600" />
                <h2 className="text-2xl font-bold text-gray-900">Care Support</h2>
              </div>
              
              <Button 
                onClick={() => handleAddRequest("need")}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                <HeartHandshake className="h-4 w-4 mr-2" />
                Request Care
              </Button>
            </div>
            
            <div className="bg-rose-100 rounded-lg p-4 mb-6">
              <p className="text-rose-800 text-sm">
                Request help with transportation, household tasks, medical assistance, childcare, eldercare, 
                pet care, meal preparation, and more. Our community is here to support you.
              </p>
            </div>
          </div>

          <MutualSupportContent 
            isLoading={isLoading}
            needs={needs}
            offers={offers}
            onItemClick={(item) => setSelectedRequest(item.originalRequest)}
            onAddRequest={handleAddRequest}
            selectedView="care"
          />
        </div>
      </div>

      <AddSupportRequestDialog 
        open={isAddRequestOpen}
        onOpenChange={setIsAddRequestOpen}
        initialRequestType={initialRequestType}
        view="care"
      />
      
      <SupportRequestDialog
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
      />
    </div>
  );
};

export default CarePage;
