import { useState, useEffect } from 'react';
import { useSupportRequests } from "@/utils/queries/useSupportRequests";
import AddSupportRequestDialog from "@/components/AddSupportRequestDialog";
import ItemRequestDialog from "@/components/support/ItemRequestDialog";
import { Button } from "@/components/ui/button";
import { HeartHandshake, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import ArchiveButton from "@/components/mutual-support/ArchiveButton";
import GlowingDescriptionBox from "@/components/ui/glowing-description-box";
import { createHighlightListener } from "@/utils/highlightNavigation";

const CarePage = () => {
  const [hoveredRequestId, setHoveredRequestId] = useState<string | null>(null);
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleHighlightItem = createHighlightListener("support");
    window.addEventListener('highlightItem', handleHighlightItem as EventListener);
    return () => {
      window.removeEventListener('highlightItem', handleHighlightItem as EventListener);
    };
  }, []);

  const {
    data: requests,
    isLoading,
    refetch
  } = useSupportRequests();

  const careRequests = requests?.filter(req => 
    req.category === 'care' && 
    !req.is_archived &&
    (searchQuery === "" || 
     req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     req.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  return (
    <div className="relative min-h-screen">
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          background: `linear-gradient(to bottom, hsla(var(--care-color), 0.15) 0%, hsla(var(--care-color), 0) 60%)`,
          zIndex: 0 
        }}
        aria-hidden="true"
      />
      
      <div className="relative z-10">
        <div className="min-h-full w-full bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8">
              <h2 className="text-2xl font-bold text-gray-900">Care Support</h2>
              
              <GlowingDescriptionBox colorClass="care-color">
                <p className="text-gray-700 text-sm">
                  Connect with neighbors for mutual care and support. Whether offering or seeking 
                  assistance, build a stronger community through compassionate connections.
                </p>
              </GlowingDescriptionBox>

              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="relative w-[280px]">
                    <Input
                      type="text"
                      placeholder="Search care requests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setIsAddRequestOpen(true)}
                      className="bg-[#FFDEE2] hover:bg-[#FFDEE2]/90 text-gray-900"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Request
                    </Button>
                  </div>
                </div>

                {careRequests.length === 0 ? (
                  <div className="max-w-4xl mx-auto mt-8">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddRequestOpen(true)} 
                      className="w-full p-8 h-auto border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center gap-4"
                    >
                      <HeartHandshake className="h-8 w-8 text-gray-400" />
                      <div className="flex flex-col items-center text-center">
                        <p className="text-lg font-medium text-gray-900">No active care requests</p>
                        <p className="text-sm text-gray-500 mt-1">Click here to request or offer support</p>
                      </div>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {careRequests.map(request => (
                      <div 
                        key={request.id}
                        className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow flex justify-between items-start"
                      >
                        <div className="flex-grow cursor-pointer" onClick={() => setSelectedRequest(request)}>
                          <h3 className="font-medium text-lg">{request.title}</h3>
                          <p className="text-gray-600 mt-1">{request.description}</p>
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              request.request_type === 'offer' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {request.request_type === 'offer' ? 'Offering Help' : 'Needs Help'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <ArchiveButton 
                            requestId={request.id}
                            tableName="care_requests"
                            onArchiveComplete={refetch}
                          />

                          <Button
                            className="min-w-[120px] transition-colors duration-200"
                            variant={hoveredRequestId === request.id ? "default" : "secondary"}
                            onMouseEnter={() => setHoveredRequestId(request.id)}
                            onMouseLeave={() => setHoveredRequestId(null)}
                            onClick={() => setSelectedRequest(request)}
                          >
                            {hoveredRequestId === request.id ? "I can Help!" : "Care Needed"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddSupportRequestDialog 
        open={isAddRequestOpen}
        onOpenChange={setIsAddRequestOpen}
        view="care"
      />

      <ItemRequestDialog
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={open => !open && setSelectedRequest(null)}
      />
    </div>
  );
};

export default CarePage;
