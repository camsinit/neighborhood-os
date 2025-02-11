
import { useState } from "react";
import { useSupportRequests } from "@/utils/queries/useSupportRequests";
import { transformRequest } from "@/utils/supportRequestTransformer";
import { ViewType } from "./types";
import MutualSupportHeader from "./MutualSupportHeader";
import SearchSection from "./SearchSection";
import MutualSupportContent from "./MutualSupportContent";
import ArchiveButton from "./ArchiveButton";
import AddSupportRequestDialog from "../AddSupportRequestDialog";
import ArchiveDialog from "../ArchiveDialog";
import SupportRequestDialog from "../support/SupportRequestDialog";

const MutualSupportContainer = () => {
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<ViewType>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [initialRequestType, setInitialRequestType] = useState<"need" | "offer" | null>(null);
  const { data: requests, isLoading } = useSupportRequests();

  const handleAddRequest = (type: "need" | "offer") => {
    setInitialRequestType(type);
    setIsAddRequestOpen(true);
  };

  const filterRequests = (items: ReturnType<typeof transformRequest>[]) => {
    let filtered = items;

    if (selectedView) {
      filtered = filtered.filter(item => 
        item.category === selectedView
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

  const shouldUseListView = selectedView === 'skills' || selectedView === 'care' || !!searchQuery;

  return (
    <div className="w-full">
      <MutualSupportHeader />
      <SearchSection 
        selectedView={selectedView}
        onViewSelect={setSelectedView}
        onSearch={setSearchQuery}
      />

      <MutualSupportContent 
        isLoading={isLoading}
        needs={needs}
        offers={offers}
        onItemClick={(item) => setSelectedRequest(item.originalRequest)}
        onAddRequest={handleAddRequest}
        useListView={shouldUseListView}
        selectedView={selectedView}
      />

      <ArchiveButton onClick={() => setIsArchiveOpen(true)} />

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
