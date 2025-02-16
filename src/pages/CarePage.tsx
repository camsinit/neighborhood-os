
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
    <div className="h-full w-full bg-white">
      <div className="flex flex-col gap-6 px-8 pt-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Care Support</h2>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-gray-600 max-w-2xl">
            Request help with transportation, household tasks, medical assistance, childcare, eldercare, pet care, meal preparation, and more.
          </p>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => handleAddRequest("need")}
              className="bg-[#1EAEDB] hover:bg-[#1EAEDB]/90"
            >
              <HeartHandshake className="h-4 w-4 mr-2" />
              Request Care
            </Button>
          </div>
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
