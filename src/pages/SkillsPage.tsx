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
  
  console.log("All requests:", requests);
  
  const skillsRequests = requests?.filter(req => {
    const isSkill = req.category === 'skills';
    console.log(`Request ${req.id}:`, {
      category: req.category,
      isSkill,
      skillCategory: req.skill_category,
      title: req.title
    });
    return isSkill;
  }) || [];

  console.log("Filtered skills requests:", skillsRequests);
  
  const filteredRequests = skillsRequests.filter(req => {
    const matchesSearch = searchQuery.toLowerCase() === '' || 
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      req.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || req.skill_category === selectedCategory;
    
    console.log(`Filtering request ${req.id}:`, {
      skillCategory: req.skill_category,
      selectedCategory,
      matchesCategory,
      matchesSearch,
      passes: matchesSearch && matchesCategory
    });
    
    return matchesSearch && matchesCategory;
  });

  console.log("Final filtered requests:", {
    selectedCategory,
    totalRequests: filteredRequests.length,
    requests: filteredRequests
  });

  const needs = filteredRequests
    .filter(req => req.request_type === 'need')
    .map(transformRequest);
    
  const offers = filteredRequests
    .filter(req => req.request_type === 'offer')
    .map(transformRequest);

  console.log("Processed requests:", {
    needs: needs.length,
    offers: offers.length
  });

  const handleAddRequest = (type: "need" | "offer") => {
    setInitialRequestType(type);
    setIsAddRequestOpen(true);
  };

  const handleCategorySelect = (category: SkillCategory) => {
    console.log("Category selected:", category);
    setSelectedCategory(category);
  };

  const pendingRequests = needs.filter(request => !request.isClaimed);

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="flex flex-col gap-6">
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
                  : 'Skills Exchange'
                }
              </h2>
            </div>
            
            {!selectedCategory && (
              <div className="bg-indigo-100 rounded-lg p-4">
                <p className="text-indigo-800 text-sm">
                  Share your expertise or learn something new. Connect with neighbors to exchange knowledge and skills.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between py-4">
              <div className="relative w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input 
                  type="search" 
                  placeholder="Search for skills..." 
                  className="pl-10" 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                />
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => handleAddRequest("offer")} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Offer Skill
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleAddRequest("need")}
                  className="bg-white"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Request Skill
                </Button>
              </div>
            </div>
          </div>

          {!selectedCategory ? (
            <CategoryList onCategorySelect={handleCategorySelect} />
          ) : (
            <>
              <MutualSupportContent 
                isLoading={isLoading}
                needs={needs}
                offers={offers}
                onItemClick={item => setSelectedRequest(item.originalRequest)}
                onAddRequest={handleAddRequest}
                selectedView="skills"
              />
              
              {pendingRequests.length > 0 && (
                <div className="px-8 py-6 mt-8 border-t">
                  <h3 className="text-lg font-semibold mb-4">Pending Skill Requests</h3>
                  <div className="space-y-4">
                    {pendingRequests.map(request => (
                      <div 
                        key={request.originalRequest.id} 
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
        </div>
      </div>

      <AddSupportRequestDialog 
        open={isAddRequestOpen}
        onOpenChange={setIsAddRequestOpen}
        initialRequestType={initialRequestType}
        view="skills"
      />
      
      <SupportRequestDialog
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={open => !open && setSelectedRequest(null)}
      />
    </div>
  );
};

export default SkillsPage;
