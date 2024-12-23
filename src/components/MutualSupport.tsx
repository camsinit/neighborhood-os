import { Button } from "@/components/ui/button";
import { useState } from "react";
import AddSupportRequestDialog from "./AddSupportRequestDialog";
import ArchiveDialog from "./ArchiveDialog";
import SearchBar from "./mutual-support/SearchBar";
import CategoryFilters from "./mutual-support/CategoryFilters";
import SupportSection from "./mutual-support/SupportSection";
import { useSupportRequests } from "@/utils/queries/useSupportRequests";
import { Skeleton } from "./ui/skeleton";

const MutualSupport = () => {
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const { data: requests, isLoading } = useSupportRequests();

  const needs = requests?.filter(req => req.request_type === 'need') || [];
  const offers = requests?.filter(req => req.request_type === 'offer') || [];

  const renderSkeleton = () => (
    <div className="space-y-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
            <Skeleton className="h-6 w-32 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mutual Support</h2>
        <Button 
          onClick={() => setIsAddRequestOpen(true)}
          className="bg-[#F3D649] hover:bg-[#F3D649]/90 text-black"
        >
          + Share Need or Offer
        </Button>
      </div>

      <div className="flex items-center gap-6 mb-8">
        <SearchBar />
        <CategoryFilters />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {isLoading ? (
          <>
            <div>{renderSkeleton()}</div>
            <div>{renderSkeleton()}</div>
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
          className="w-full max-w-xs border-[#F3D649] border-dotted hover:bg-[#F3D649]/10"
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