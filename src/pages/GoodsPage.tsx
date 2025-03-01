
import { useState } from 'react';
import { useSupportRequests } from "@/utils/queries/useSupportRequests";
import AddSupportRequestDialog from "@/components/AddSupportRequestDialog";
import SupportRequestDialog from "@/components/support/SupportRequestDialog";
import { Button } from "@/components/ui/button";
import { Gift, Search, Plus, CalendarClock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import ArchiveButton from "@/components/mutual-support/ArchiveButton";
import { GoodsRequestUrgency } from '@/components/support/types/formTypes';
import { GoodsExchangeItem } from '@/types/localTypes';

const GoodsPage = () => {
  // Define our state variables
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<GoodsExchangeItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [initialRequestType, setInitialRequestType] = useState<"need" | "offer" | null>(null);

  // Fetch support requests data
  const { 
    data: requests, 
    isLoading,
    refetch
  } = useSupportRequests();

  // Filter goods items (offers)
  const goodsItems = requests?.filter(req => 
    req.category === 'goods' && 
    !req.is_archived &&
    req.request_type === 'offer' &&
    (searchQuery === "" || 
     req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     req.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  // Filter goods requests (needs)
  const goodsRequests = requests?.filter(req => 
    req.category === 'goods' && 
    !req.is_archived &&
    req.request_type === 'need' &&
    (searchQuery === "" || 
     req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     req.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  // Filter for urgent requests
  const urgentRequests = goodsRequests.filter(req => {
    // Cast req to GoodsExchangeItem to access the urgency property
    const goodsReq = req as GoodsExchangeItem;
    return goodsReq.urgency === 'high' || goodsReq.urgency === 'critical';
  });

  // Helper function to get the CSS class for urgency badges
  const getUrgencyClass = (urgency: GoodsRequestUrgency) => {
    switch(urgency) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // Helper function to get the display label for urgency levels
  const getUrgencyLabel = (urgency: GoodsRequestUrgency) => {
    switch(urgency) {
      case 'critical': return 'Critical';
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Medium';
    }
  };

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-[#FEC6A1] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h2 className="text-2xl font-bold text-gray-900">Goods</h2>
          
          {/* Introduction card */}
          <div className="bg-white rounded-lg p-4 mt-2 mb-6 shadow-md">
            <p className="text-gray-700 text-sm">
              Share and request items within your community. From tools to furniture, 
              connect with neighbors to give, receive, or borrow what you need.
            </p>
          </div>

          {/* Urgent requests section */}
          {urgentRequests.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-medium">Urgent Neighbor Requests</h3>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {urgentRequests.map(request => {
                  // Cast the request to GoodsExchangeItem to access the urgency property
                  const goodsRequest = request as GoodsExchangeItem;
                  return (
                    <div 
                      key={request.id}
                      className="bg-red-50 border border-red-100 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer relative"
                      onClick={() => setSelectedRequest(goodsRequest)}
                    >
                      <div className="flex justify-between">
                        <h3 className="font-medium text-lg">{request.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getUrgencyClass(goodsRequest.urgency as GoodsRequestUrgency)
                        }`}>
                          {getUrgencyLabel(goodsRequest.urgency as GoodsRequestUrgency)}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1 line-clamp-2">{request.description}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <CalendarClock className="h-3 w-3" />
                          <span>Posted {new Date(request.created_at).toLocaleDateString()}</span>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs">
                          I Can Help
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main content section */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            {/* Search bar and action buttons */}
            <div className="flex items-center justify-between mb-6">
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

              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setInitialRequestType("need");
                    setIsAddRequestOpen(true);
                  }}
                  variant="outline"
                  className="border-[#FEC6A1] text-gray-700"
                >
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Request Item
                </Button>
                <Button 
                  onClick={() => {
                    setInitialRequestType("offer");
                    setIsAddRequestOpen(true);
                  }}
                  className="bg-[#FEC6A1] hover:bg-[#FEC6A1]/90 text-gray-900"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Offer Item
                </Button>
              </div>
            </div>

            {/* Available items section */}
            {goodsItems.length === 0 ? (
              <div className="max-w-4xl mx-auto mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setInitialRequestType("offer");
                    setIsAddRequestOpen(true);
                  }}
                  className="w-full p-8 h-auto border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center gap-4"
                >
                  <Gift className="h-8 w-8 text-gray-400" />
                  <div className="flex flex-col items-center text-center">
                    <p className="text-lg font-medium text-gray-900">No items available</p>
                    <p className="text-sm text-gray-500 mt-1">Click here to offer an item to your neighbors</p>
                  </div>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {goodsItems.map(request => {
                  // Cast the request to GoodsExchangeItem to access the goods_category and images properties
                  const goodsItem = request as GoodsExchangeItem;
                  return (
                    <div 
                      key={request.id}
                      className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer relative"
                    >
                      <div onClick={() => setSelectedRequest(goodsItem)}>
                        {request.image_url && (
                          <div className="aspect-w-16 aspect-h-9 mb-4">
                            <img 
                              src={request.image_url} 
                              alt={request.title}
                              className="object-cover rounded-md h-48 w-full"
                            />
                          </div>
                        )}
                        
                        {goodsItem.images && goodsItem.images.length > 0 && !request.image_url && (
                          <div className="aspect-w-16 aspect-h-9 mb-4">
                            <img 
                              src={goodsItem.images[0]} 
                              alt={request.title}
                              className="object-cover rounded-md h-48 w-full"
                            />
                            {goodsItem.images.length > 1 && (
                              <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
                                +{goodsItem.images.length - 1} more
                              </div>
                            )}
                          </div>
                        )}
                        
                        <h3 className="font-medium text-lg">{request.title}</h3>
                        <p className="text-gray-600 mt-1 line-clamp-2">{request.description}</p>
                        
                        {goodsItem.goods_category && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {goodsItem.goods_category}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="absolute top-2 right-2">
                        <ArchiveButton 
                          requestId={request.id}
                          tableName="goods_exchange"
                          onArchiveComplete={refetch}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Non-urgent requests section */}
            {goodsRequests.length > 0 && urgentRequests.length < goodsRequests.length && (
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Other Item Requests</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {goodsRequests
                    .filter(req => {
                      // Cast to GoodsExchangeItem to access urgency
                      const goodsReq = req as GoodsExchangeItem;
                      return goodsReq.urgency !== 'high' && goodsReq.urgency !== 'critical';
                    })
                    .map(request => {
                      // Cast to GoodsExchangeItem to access urgency
                      const goodsReq = request as GoodsExchangeItem;
                      return (
                        <div 
                          key={request.id}
                          className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer relative"
                          onClick={() => setSelectedRequest(goodsReq)}
                        >
                          <div className="flex justify-between">
                            <h3 className="font-medium text-lg">{request.title}</h3>
                            {goodsReq.urgency && (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                getUrgencyClass(goodsReq.urgency as GoodsRequestUrgency)
                              }`}>
                                {getUrgencyLabel(goodsReq.urgency as GoodsRequestUrgency)}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mt-1 line-clamp-2">{request.description}</p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <CalendarClock className="h-3 w-3" />
                              <span>Posted {new Date(request.created_at).toLocaleDateString()}</span>
                            </div>
                            <Button size="sm" variant="outline" className="text-xs">
                              I Can Help
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog components */}
      <AddSupportRequestDialog 
        open={isAddRequestOpen}
        onOpenChange={setIsAddRequestOpen}
        initialRequestType={initialRequestType}
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
