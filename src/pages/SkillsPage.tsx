
import { useSkillsExchange } from "@/utils/queries/useSkillsExchange";
import { useState } from "react";
import AddSupportRequestDialog from "@/components/AddSupportRequestDialog";
import SupportRequestDialog from "@/components/support/SupportRequestDialog";
import { CategoryList } from "@/components/skills/CategoryList";
import SkillsHeader from "@/components/skills/SkillsHeader";
import SkillsList from "@/components/skills/SkillsList";
import { SkillSessionRequestDialog } from "@/components/skills/SkillSessionRequestDialog";
import { SkillCategory } from "@/components/mutual-support/types";

const SkillsPage = () => {
  // State management
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [initialRequestType, setInitialRequestType] = useState<"need" | "offer" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  const [showOnlyRequests, setShowOnlyRequests] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Fetch skills data
  const { data: skillsExchange, isLoading } = useSkillsExchange();
  
  // Filter skills based on search, category, and requests filter
  const filteredSkills = skillsExchange?.filter(skill => {
    const matchesSearch = searchQuery.toLowerCase() === '' || 
      skill.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      skill.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || skill.skill_category === selectedCategory;
    const matchesType = showOnlyRequests ? skill.request_type === 'need' : true;
    
    return matchesSearch && matchesCategory && matchesType;
  }) || [];

  // Transform skills data for display
  const needs = filteredSkills
    .filter(skill => skill.request_type === 'need')
    .map(skill => ({
      type: "Needs Help" as const,
      title: skill.title,
      description: skill.description || "",
      timeAgo: new Date(skill.created_at).toLocaleDateString(),
      borderColor: "border-red-200",
      tagColor: "text-red-500",
      tagBg: "bg-red-50",
      requestType: skill.request_type,
      category: "skills",
      supportType: "ongoing",
      imageUrl: null,
      skillCategory: skill.skill_category as SkillCategory,
      originalRequest: skill,
      profiles: skill.profiles,
    }));
    
  const offers = filteredSkills
    .filter(skill => skill.request_type === 'offer')
    .map(skill => ({
      type: "Offering Help" as const,
      title: skill.title,
      description: skill.description || "",
      timeAgo: new Date(skill.created_at).toLocaleDateString(),
      borderColor: "border-green-200",
      tagColor: "text-green-500",
      tagBg: "bg-green-50",
      requestType: skill.request_type,
      category: "skills",
      supportType: "ongoing",
      imageUrl: null,
      skillCategory: skill.skill_category as SkillCategory,
      originalRequest: skill,
      profiles: skill.profiles,
    }));

  const handleAddRequest = (type: "need" | "offer") => {
    setInitialRequestType(type);
    setIsAddRequestOpen(true);
  };

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {showOnlyRequests ? "Skill Requests" : "Skills Exchange"}
              </h2>
              <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 mt-2">
                <p className="text-gray-700 text-sm">
                  {showOnlyRequests 
                    ? "Browse and respond to current skill requests from your neighbors. Connect with those seeking to learn and share your expertise."
                    : "Welcome to the Skills Exchange. Browse categories, offer your expertise, or request help from neighbors. Build community through sharing knowledge and skills."
                  }
                </p>
              </div>
            </div>

            <SkillsHeader 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onAddRequest={handleAddRequest}
              onViewRequests={() => setShowOnlyRequests(!showOnlyRequests)}
              isViewingRequests={showOnlyRequests}
            />
          </div>

          {!selectedCategory && !showOnlyRequests ? (
            <CategoryList onCategorySelect={setSelectedCategory} />
          ) : (
            <SkillsList 
              isLoading={isLoading}
              needs={needs}
              offers={offers}
              onItemClick={setSelectedRequest}
              onAddRequest={handleAddRequest}
              selectedCategory={selectedCategory}
            />
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

      <SkillSessionRequestDialog
        sessionId={sessionId}
        onOpenChange={() => setSessionId(null)}
      />
    </div>
  );
};

export default SkillsPage;
