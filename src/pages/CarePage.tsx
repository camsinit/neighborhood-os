
import { useState, useEffect } from 'react';
import { useSupportRequests } from "@/utils/queries/useSupportRequests";
import AddSupportRequestDialog from "@/components/AddSupportRequestDialog";
import AddCareRequestDialog from "@/components/care/AddCareRequestDialog";
import ItemRequestDialog from "@/components/support/ItemRequestDialog";
import { Button } from "@/components/ui/button";
import { HeartHandshake, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import ArchiveButton from "@/components/mutual-support/ArchiveButton";
import { createHighlightListener } from "@/utils/highlightNavigation";
import NotificationPopover from "@/components/notifications/NotificationPopover";
import ModuleLayout from "@/components/layout/ModuleLayout";
import ModuleButton from "@/components/ui/module-button";

/**
 * CarePage component
 * 
 * Displays a list of care requests and offers with search functionality
 * Uses NotificationPopover for consistent UI across the application
 */
const CarePage = () => {
  const [hoveredRequestId, setHoveredRequestId] = useState<string | null>(null);
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Set up event listener for highlighting items when navigated to from notifications
  useEffect(() => {
    // This creates a listener that will highlight the specified support item when triggered
    const handleHighlightItem = createHighlightListener("support");
    window.addEventListener('highlightItem', handleHighlightItem as EventListener);
    return () => {
      window.removeEventListener('highlightItem', handleHighlightItem as EventListener);
    };
  }, []);

  // Fetch all support requests
  const {
    data: requests,
    isLoading,
    refetch
  } = useSupportRequests();

  // Filter requests to only show care category and match search query
  const careRequests = requests?.filter(req => 
    req.category === 'care' && 
    !req.is_archived &&
    (searchQuery === "" || 
     req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     req.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  return (
    <ModuleLayout
      title="Care Support"
      themeColor="care"
      description="Connect with neighbors for mutual care and support. Whether offering or seeking assistance, build a stronger community through compassionate connections."
    >
      <div className="flex items-center justify-between mb-6">
        {/* Search input */}
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

        {/* Add request button */}
        <div className="flex gap-2">
          <ModuleButton 
            onClick={() => setIsAddRequestOpen(true)}
            moduleTheme="care"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Request
          </ModuleButton>
        </div>
      </div>

      {/* Empty state */}
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
        /* Care request list */
        <div className="space-y-4">
          {careRequests.map(request => (
            <NotificationPopover
              key={request.id}
              title={request.title}
              type="support"
              itemId={request.id}
              description={request.description}
              onAction={() => setSelectedRequest(request)}
              actionLabel={request.request_type === 'need' ? "I Can Help" : "Contact Me"}
              isArchived={request.is_archived}
            >
              <div 
                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow flex justify-between items-start"
              >
                <div className="flex-grow cursor-pointer">
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
                  >
                    {hoveredRequestId === request.id ? "I can Help!" : "Care Needed"}
                  </Button>
                </div>
              </div>
            </NotificationPopover>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AddCareRequestDialog 
        open={isAddRequestOpen}
        onOpenChange={setIsAddRequestOpen}
      />

      <ItemRequestDialog
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={open => !open && setSelectedRequest(null)}
      />
    </ModuleLayout>
  );
};

export default CarePage;
