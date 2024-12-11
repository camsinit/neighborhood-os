import { Archive, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AddSupportRequestDialog from "./AddSupportRequestDialog";
import ArchiveDialog from "./ArchiveDialog";
import SupportRequestCard from "./SupportRequestCard";
import { supportRequests } from "@/data/support-requests";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MutualSupport = () => {
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [initialRequestType, setInitialRequestType] = useState<"need" | "offer" | null>(null);
  const [filter, setFilter] = useState<"all" | "needs" | "offers">("all");

  const filteredRequests = supportRequests.filter((request) => {
    if (filter === "all") return true;
    if (filter === "needs") return request.type === "need";
    if (filter === "offers") return request.type === "offer";
    return true;
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mutual Support</h2>
        <Button 
          onClick={() => setIsArchiveOpen(true)}
          variant="archive"
          className="flex items-center gap-2"
        >
          <Archive className="h-4 w-4" />
          Archive
        </Button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {filter === "all" ? "All Requests" : filter === "needs" ? "Needs" : "Offers"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilter("all")}>All Requests</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("needs")}>Needs</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("offers")}>Offers</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setInitialRequestType("need");
              setIsAddRequestOpen(true);
            }}
            variant="outline"
            className="bg-purple-100 hover:bg-purple-200 text-purple-700"
          >
            <Plus className="h-4 w-4" />
            Add Need
          </Button>
          <Button
            onClick={() => {
              setInitialRequestType("offer");
              setIsAddRequestOpen(true);
            }}
            variant="outline"
            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Add Offer
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRequests.map((request) => (
          <SupportRequestCard key={request.id} request={request} />
        ))}
      </div>
      <AddSupportRequestDialog
        open={isAddRequestOpen}
        onOpenChange={setIsAddRequestOpen}
        initialRequestType={initialRequestType}
      />
      <ArchiveDialog
        open={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
      />
    </div>
  );
};

export default MutualSupport;