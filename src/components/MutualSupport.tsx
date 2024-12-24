import { useState } from "react";
import AddSupportRequestDialog from "./AddSupportRequestDialog";
import ArchiveDialog from "./ArchiveDialog";
import { Button } from "@/components/ui/button";
import SupportSection from "./mutual-support/SupportSection";
import { useSupportRequests } from "@/utils/queries/useSupportRequests";
import MutualSupportHeader from "./mutual-support/MutualSupportHeader";
import SearchSection from "./mutual-support/SearchSection";
import LoadingSkeleton from "./mutual-support/LoadingSkeleton";
import { transformRequest } from "@/utils/supportRequestTransformer";

const MutualSupport = () => {
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: requests, isLoading } = useSupportRequests();

  const filterRequests = (items: ReturnType<typeof transformRequest>[]) => {
    let filtered = items;

    // Filter by category if selected
    if (selectedCategory) {
      filtered = filtered.filter(item => 
        item.requestType.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search query if present
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

  return (
    <div className="w-full">
      <MutualSupportHeader onAddRequest={() => setIsAddRequestOpen(true)} />
      <SearchSection 
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        onSearch={setSearchQuery}
      />

      <div className="grid md:grid-cols-2 gap-8">
        {isLoading ? (
          <>
            <LoadingSkeleton />
            <LoadingSkeleton />
          </>
        ) : (
          <>
            <SupportSection title="Needs" items={needs} />
            <SupportSection title="Offers" items={offers} />
          </>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <Button 
          variant="outline"
          onClick={() => setIsArchiveOpen(true)}
          className="w-full max-w-xs border-[#9b87f5] border-dotted hover:bg-[#9b87f5]/10"
        >
          Archive
        </Button>
      </div>

      <AddSupportRequestDialog 
        open={isAddRequestOpen}
        onOpenChange={setIsAddRequestOpen}
      />
      <ArchiveDialog
        open={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
      />
    </div>
  );
};

export default MutualSupport;