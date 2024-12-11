import { Button } from "@/components/ui/button";
import { useState } from "react";
import AddSupportRequestDialog from "./AddSupportRequestDialog";
import ArchiveDialog from "./ArchiveDialog";
import SearchBar from "./mutual-support/SearchBar";
import CategoryFilters from "./mutual-support/CategoryFilters";
import SupportSection from "./mutual-support/SupportSection";
import { SupportItem } from "./mutual-support/types";

const MutualSupport = () => {
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  const needs: SupportItem[] = [
    {
      type: "Needs Help",
      title: "Grocery Shopping Helper",
      description: "Looking for assistance with weekly grocery shopping. I have mobility issues and would appreciate help every Saturday morning.",
      timeAgo: "11 months ago",
      borderColor: "border-l-purple-500",
      tagColor: "text-purple-600",
      tagBg: "bg-purple-100",
      requestType: "Transportation"
    }
  ];

  const offers: SupportItem[] = [
    {
      type: "Offering Help",
      title: "Garden Tools Available",
      description: "Offering to lend gardening tools including spades, rakes, and a lawn mower for the weekend.",
      timeAgo: "11 months ago",
      borderColor: "border-l-emerald-500",
      tagColor: "text-emerald-600",
      tagBg: "bg-emerald-100",
      requestType: "Goods"
    },
    {
      type: "Offering Help",
      title: "Free Moving Boxes",
      description: "Just finished moving, have 20+ boxes in good condition. Perfect for anyone planning to move.",
      timeAgo: "11 months ago",
      borderColor: "border-l-emerald-500",
      tagColor: "text-emerald-600",
      tagBg: "bg-emerald-100",
      requestType: "Goods"
    }
  ];

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
        <SupportSection title="Needs" items={needs} />
        <SupportSection title="Offers" items={offers} />
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