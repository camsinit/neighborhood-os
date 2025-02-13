
import { useSupportRequests } from "@/utils/queries/useSupportRequests";
import { transformRequest } from "@/utils/supportRequestTransformer";
import { useState } from "react";
import MutualSupportContent from "@/components/mutual-support/MutualSupportContent";
import AddSupportRequestDialog from "@/components/AddSupportRequestDialog";
import SupportRequestDialog from "@/components/support/SupportRequestDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, HelpCircle, ArrowLeft } from "lucide-react";
import { SkillCategory } from "@/components/mutual-support/types";
import { CategoryList } from "@/components/skills/CategoryList";

const SkillsPage = () => {
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [initialRequestType, setInitialRequestType] = useState<"need" | "offer" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  
  const { data: requests, isLoading } = useSupportRequests();

  const skillsRequests = requests?.filter(req => req.category === 'skills') || [];

  const filteredRequests = skillsRequests.filter(req => {
    const matchesSearch = searchQuery.toLowerCase() === '' || 
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || req.skill_category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const needs = filteredRequests
    .filter(req => req.request_type === 'need')
    .map(transformRequest);
    
  const offers = filteredRequests
    .filter(req => req.request_type === 'offer')
    .map(transformRequest);

  const handleAddRequest = (type: "need" | "offer") => {
    setInitialRequestType(type);
    setIsAddRequestOpen(true);
  };

  const pendingRequests = needs.filter(request => !request.isClaimed);

  return (
    <div className="h-full w-full bg-white">
      <div className="flex flex-col gap-6 px-8 pt-8">
        <div className="flex items-center gap-4">
          {selectedCategory && (
            <Button 
              variant="ghost" 
              onClick={() => setSelectedCategory(null)}
              className="p-0 hover:bg-transparent"
            >
              <ArrowLeft className="h-6 w-6 mr-2" />
              Back to Categories
            </Button>
          )}
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedCategory 
              ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Skills` 
              : 'Skills Exchange'}
          </h2>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input 
              type="search"
              placeholder="Search for skills..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => handleAddRequest("offer")}
              className="bg-[#1EAEDB] hover:bg-[#1EAEDB]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Offer Skill
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => handleAddRequest("need")}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Request Skill
            </Button>
          </div>
        </div>
      </div>

      {!selectedCategory ? (
        <CategoryList onCategorySelect={setSelectedCategory} />
      ) : (
        <>
          <MutualSupportContent 
            isLoading={isLoading}
            needs={needs}
            offers={offers}
            onItemClick={(item) => setSelectedRequest(item.originalRequest)}
            onAddRequest={handleAddRequest}
            selectedView="skills"
          />
          
          {pendingRequests.length > 0 && (
            <div className="px-8 py-6 mt-8 border-t">
              <h3 className="text-lg font-semibold mb-4">Pending Skill Requests</h3>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div 
                    key={request.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer"
                    onClick={() => setSelectedRequest(request.originalRequest)}
                  >
                    <h4 className="font-medium text-gray-900">{request.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <AddSupportRequestDialog 
        open={isAddRequestOpen}
        onOpenChange={setIsAddRequestOpen}
        initialRequestType={initialRequestType}
        view="skills"
      />
      
      <SupportRequestDialog
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
      />
    </div>
  );
};

export default SkillsPage;
