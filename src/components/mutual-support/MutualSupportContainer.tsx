import { useState } from "react";
import { useSupportRequests } from "@/utils/queries/useSupportRequests";
import { transformRequest } from "@/utils/supportRequestTransformer";
import { ViewType } from "./types";
import MutualSupportHeader from "./MutualSupportHeader";
import SearchSection from "./SearchSection";
import MutualSupportContent from "./MutualSupportContent";
import AddSupportRequestDialog from "../AddSupportRequestDialog";
import ArchiveDialog from "../ArchiveDialog";
import SupportRequestDialog from "../support/SupportRequestDialog";
import { Button } from "@/components/ui/button";

interface MutualSupportContainerProps {
  selectedView?: ViewType;
}

const MutualSupportContainer = ({ selectedView }: MutualSupportContainerProps) => {
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [initialRequestType, setInitialRequestType] = useState<"need" | "offer" | null>(null);
  const { data: requests, isLoading } = useSupportRequests();

  const [localView, setLocalView] = useState<ViewType>(selectedView || null);
  const activeView = selectedView || localView;

  const handleAddRequest = (type: "need" | "offer") => {
    setInitialRequestType(type);
    setIsAddRequestOpen(true);
  };

  const filterRequests = (items: ReturnType<typeof transformRequest>[]) => {
    let filtered = items;

    if (activeView) {
      filtered = filtered.filter(item => 
        item.category === activeView
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        (item.description?.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  const needs = filterRequests(
    requests
      ?.filter(req => req.request_type === 'need')
      .map(transformRequest) || []
  );
    
  const offers = filterRequests(
    requests
      ?.filter(req => req.request_type === 'offer')
      .map(transformRequest) || []
  );

  const shouldUseListView = activeView === 'skills' || activeView === 'care' || !!searchQuery;

  return (
    <div className="w-full">
      <MutualSupportHeader />
      <SearchSection 
        selectedView={activeView}
        onViewSelect={setLocalView}
        onSearch={setSearchQuery}
      />

      <MutualSupportContent 
        isLoading={isLoading}
        needs={needs}
        offers={offers}
        onItemClick={(item) => setSelectedRequest(item.originalRequest)}
        onAddRequest={handleAddRequest}
        useListView={shouldUseListView}
        selectedView={activeView}
      />

      <Button 
        variant="outline"
        onClick={() => setIsArchiveOpen(true)}
        className="mt-4"
      >
        View Archived Items
      </Button>

      <AddSupportRequestDialog 
        open={isAddRequestOpen}
        onOpenChange={setIsAddRequestOpen}
        initialRequestType={initialRequestType}
      />
      <ArchiveDialog
        open={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
      />
      <SupportRequestDialog
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
      />
    </div>
  );
};

export default MutualSupportContainer;
