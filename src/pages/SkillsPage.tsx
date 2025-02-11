
import { useSupportRequests } from "@/utils/queries/useSupportRequests";
import { transformRequest } from "@/utils/supportRequestTransformer";
import { useState } from "react";
import MutualSupportContent from "@/components/mutual-support/MutualSupportContent";
import AddSupportRequestDialog from "@/components/AddSupportRequestDialog";
import SupportRequestDialog from "@/components/support/SupportRequestDialog";

const SkillsPage = () => {
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [initialRequestType, setInitialRequestType] = useState<"need" | "offer" | null>(null);
  const { data: requests, isLoading } = useSupportRequests();

  const skillsRequests = requests?.filter(req => req.category === 'skills') || [];

  const needs = skillsRequests
    .filter(req => req.request_type === 'need')
    .map(transformRequest);
    
  const offers = skillsRequests
    .filter(req => req.request_type === 'offer')
    .map(transformRequest);

  const handleAddRequest = (type: "need" | "offer") => {
    setInitialRequestType(type);
    setIsAddRequestOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="p-6 rounded-lg bg-white shadow-md">
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Skills Exchange</h2>
        </div>

        <MutualSupportContent 
          isLoading={isLoading}
          needs={needs}
          offers={offers}
          onItemClick={(item) => setSelectedRequest(item.originalRequest)}
          onAddRequest={handleAddRequest}
          selectedView="skills"
        />

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
    </div>
  );
};

export default SkillsPage;
