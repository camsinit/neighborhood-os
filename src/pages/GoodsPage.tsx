
// Add thorough comments to explain the structure and styling choices
import { useState } from 'react';
import { useSupportRequests } from "@/utils/queries/useSupportRequests";
import AddSupportRequestDialog from "@/components/AddSupportRequestDialog";
import SupportRequestDialog from "@/components/support/SupportRequestDialog";
import { Button } from "@/components/ui/button";
import { Gift, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import ArchiveButton from "@/components/mutual-support/ArchiveButton";

const GoodsPage = () => {
  // State management for dialogs, search, and request data
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { 
    data: requests, 
    isLoading,
    refetch
  } = useSupportRequests();

  // Filter goods requests based on search query and archived status
  const goodsRequests = requests?.filter(req => 
    req.category === 'goods' && 
    !req.is_archived &&
    (searchQuery === "" || 
     req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     req.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-[#FEC6A1] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Standardized Header Section */}
        <div className="py-8">
          {/* Page Title - Using exact page name */}
          <h2 className="text-2xl font-bold text-gray-900">Goods</h2>
          
          {/* Description Box - Solid white background */}
          <div className="bg-white rounded-lg p-4 mt-2 mb-6">
            <p className="text-gray-700 text-sm">
              Share and request items within your community. From tools to furniture, 
              connect with neighbors to give, receive, or borrow what you need.
            </p>
          </div>

          {/* Main Content Container - White background */}
          <div className="bg-white rounded-lg p-6">
            {/* Search and Actions Bar */}
            <div className="flex items-center justify-between mb-6">
              {/* Search Bar Section */}
              <div className="relative w-[280px]">
                <Input
                  type="text"
                  placeholder="Search goods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsAddRequestOpen(true)}
                  className="bg-[#FEC6A1] hover:bg-[#FEC6A1]/90"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            {/* Content Section */}
            {goodsRequests.length === 0 ? (
              <div className="max-w-4xl mx-auto mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddRequestOpen(true)} 
                  className="w-full p-8 h-auto border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center gap-4"
                >
                  <Gift className="h-8 w-8 text-gray-400" />
                  <div className="flex flex-col items-center text-center">
                    <p className="text-lg font-medium text-gray-900">No active goods requests</p>
                    <p className="text-sm text-gray-500 mt-1">Click here to share or request items</p>
                  </div>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {goodsRequests.map(request => (
                  <div 
                    key={request.id}
                    className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer relative"
                  >
                    <div onClick={() => setSelectedRequest(request)}>
                      {request.image_url && (
                        <div className="aspect-w-16 aspect-h-9 mb-4">
                          <img 
                            src={request.image_url} 
                            alt={request.title}
                            className="object-cover rounded-md"
                          />
                        </div>
                      )}
                      <h3 className="font-medium text-lg">{request.title}</h3>
                      <p className="text-gray-600 mt-1">{request.description}</p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.request_type === 'offer' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {request.request_type === 'offer' ? 'Offering' : 'Needed'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Archive Button */}
                    <div className="absolute top-2 right-2">
                      <ArchiveButton 
                        requestId={request.id}
                        tableName="goods_exchange"
                        onArchiveComplete={refetch}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <AddSupportRequestDialog 
        open={isAddRequestOpen}
        onOpenChange={setIsAddRequestOpen}
        view="goods"
      />

      <SupportRequestDialog
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={open => !open && setSelectedRequest(null)}
      />
    </div>
  );
};

export default GoodsPage;
