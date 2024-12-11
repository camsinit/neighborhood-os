import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import ArchiveDialog from "./ArchiveDialog";
import AddSupportRequestDialog from "./AddSupportRequestDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const MutualSupport = () => {
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);

  const { data: supportRequests = [] } = useQuery({
    queryKey: ["support-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_requests")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const needs = supportRequests.filter((request) => request.type === "need");
  const offers = supportRequests.filter((request) => request.type === "offer");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b">Mutual Support</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-[#F3D649] border-dotted hover:bg-[#F3D649] hover:bg-opacity-10"
            onClick={() => setIsArchiveOpen(true)}
          >
            Archive
          </Button>
          <Button onClick={() => setIsAddRequestOpen(true)}>Add Request</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold mb-4">Needs</h3>
          <div className="space-y-4">
            {needs.map((need) => (
              <div
                key={need.id}
                className="p-4 rounded-lg border bg-white shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      {need.request_type}
                    </span>
                  </div>
                  <h4 className="font-medium">{need.title}</h4>
                  <p className="text-sm text-gray-600">
                    {need.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Need by: {format(new Date(need.valid_until), "PPP")}
                    </span>
                    <Button variant="secondary">I can help</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Offers</h3>
          <div className="space-y-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="p-4 rounded-lg border bg-white shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
                      {offer.request_type}
                    </span>
                  </div>
                  <h4 className="font-medium">{offer.title}</h4>
                  <p className="text-sm text-gray-600">
                    {offer.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Offer available until: {format(new Date(offer.valid_until), "PPP")}
                    </span>
                    <Button variant="secondary">I'm Interested</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ArchiveDialog
        open={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
        type="support"
      />

      <AddSupportRequestDialog
        open={isAddRequestOpen}
        onOpenChange={setIsAddRequestOpen}
      />
    </div>
  );
};

export default MutualSupport;