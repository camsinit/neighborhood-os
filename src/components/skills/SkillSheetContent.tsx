import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import SkillContactPopover from "./SkillContactPopover";
import ShareButton from "@/components/ui/share-button";
import { SkillCategory } from "./types/skillTypes";

/**
 * SkillSheetContent - Displays detailed skill information in a side sheet
 * 
 * Shows skill details, all neighbors who offer this skill, and action buttons
 * for "Have this skill?" and "Contact" functionality.
 */
interface SkillSheetContentProps {
  skillTitle: string;
  skillCategory: SkillCategory;
  onOpenChange?: (open: boolean) => void;
}
interface SkillProvider {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  description: string | null;
  availability: string | null;
  skill_id: string;
}
const SkillSheetContent = ({
  skillTitle,
  skillCategory,
  onOpenChange
}: SkillSheetContentProps) => {
  const user = useUser();
  const [providers, setProviders] = useState<SkillProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [userHasSkill, setUserHasSkill] = useState(false);

  // Function to close the sheet
  const handleSheetClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  // Fetch all providers for this skill
  useEffect(() => {
    const fetchProviders = async () => {
      if (!user) return;
      try {
        // Get user's neighborhood
        const {
          data: userNeighborhood
        } = await supabase.from('neighborhood_members').select('neighborhood_id').eq('user_id', user.id).eq('status', 'active').single();
        if (!userNeighborhood) return;

        // Fetch skills with user profiles
        const {
          data: skills,
          error
        } = await supabase.from('skills_exchange').select(`
            id,
            user_id,
            description,
            availability,
            profiles:user_id (
              display_name,
              avatar_url
            )
          `).eq('neighborhood_id', userNeighborhood.neighborhood_id).eq('skill_category', skillCategory).eq('title', skillTitle).eq('request_type', 'offer').eq('is_archived', false);
        if (error) throw error;

        // Transform the data
        const providersData = skills?.map(skill => ({
          user_id: skill.user_id,
          display_name: skill.profiles?.display_name || 'Anonymous',
          avatar_url: skill.profiles?.avatar_url,
          description: skill.description,
          availability: skill.availability,
          skill_id: skill.id
        })) || [];
        setProviders(providersData);

        // Check if current user offers this skill
        setUserHasSkill(providersData.some(p => p.user_id === user.id));
      } catch (error) {
        console.error('Error fetching skill providers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, [user, skillTitle, skillCategory]);

  // Handle "Have this skill?" button click
  const handleAddSkill = async () => {
    if (!user) return;
    try {
      // Get user's neighborhood
      const {
        data: userNeighborhood
      } = await supabase.from('neighborhood_members').select('neighborhood_id').eq('user_id', user.id).eq('status', 'active').single();
      if (!userNeighborhood) return;

      // Add the skill offer
      const {
        error
      } = await supabase.from('skills_exchange').insert({
        user_id: user.id,
        neighborhood_id: userNeighborhood.neighborhood_id,
        title: skillTitle,
        skill_category: skillCategory,
        request_type: 'offer',
        valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days from now
      });
      if (error) throw error;

      // Refresh the providers list
      setUserHasSkill(true);
      // Re-fetch providers...
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  // Category colors matching the existing system
  const categoryColors: Record<SkillCategory, {
    bg: string;
    text: string;
  }> = {
    technology: {
      bg: 'bg-[#D3E4FD]',
      text: 'text-[#221F26]'
    },
    emergency: {
      bg: 'bg-[#FFDEE2]',
      text: 'text-[#D946EF]'
    },
    professional: {
      bg: 'bg-[#E5DEFF]',
      text: 'text-[#8B5CF6]'
    },
    maintenance: {
      bg: 'bg-[#FDE1D3]',
      text: 'text-[#F97316]'
    },
    care: {
      bg: 'bg-[#FFDEE2]',
      text: 'text-[#D946EF]'
    },
    education: {
      bg: 'bg-[#F2FCE2]',
      text: 'text-emerald-600'
    }
  };
  const categoryStyle = categoryColors[skillCategory] || categoryColors.technology;
  return <SheetContent className="sm:max-w-md overflow-y-auto">
      <SheetHeader className="mb-4">
        <SheetTitle className="text-xl font-bold flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <span>{skillTitle}</span>
            
          </div>
          <div className="flex items-center gap-2">
            <ShareButton contentType="skills" contentId={providers[0]?.skill_id || ''} neighborhoodId="" size="sm" variant="ghost" />
          </div>
        </SheetTitle>
      </SheetHeader>

      <div className="space-y-6">
        {/* Skill overview */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Skill Overview</h3>
          <p className="text-gray-600">
            {providers.length} neighbor{providers.length !== 1 ? 's' : ''} offer{providers.length === 1 ? 's' : ''} this skill in your area.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {!userHasSkill && <Button onClick={handleAddSkill} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white">
              <Plus className="h-4 w-4" />
              Have this skill?
            </Button>}
          
          <SkillContactPopover skillTitle={skillTitle} skillCategory={skillCategory}>
            <Button variant="outline" className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50">
              <MessageSquare className="h-4 w-4" />
              Request Help
            </Button>
          </SkillContactPopover>
        </div>

        {/* Providers list */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Neighbors Who Offer This</h3>
          {loading ? <div className="text-gray-500">Loading...</div> : providers.length === 0 ? <div className="text-gray-500">No neighbors currently offer this skill.</div> : <div className="space-y-4">
              {providers.map(provider => <div key={provider.user_id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={provider.avatar_url || undefined} />
                    <AvatarFallback>
                      {provider.display_name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {provider.display_name}
                      {provider.user_id === user?.id && <span className="text-sm text-gray-500 font-normal"> (You)</span>}
                    </h4>
                    
                    {provider.description && <p className="text-sm text-gray-600 mt-1">{provider.description}</p>}
                    
                    {provider.availability && <p className="text-xs text-gray-500 mt-1">
                        Available: {provider.availability}
                      </p>}
                  </div>
                  
                  {provider.user_id !== user?.id && <SkillContactPopover skillTitle={skillTitle} skillCategory={skillCategory}>
                      <Button size="sm" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                        Contact
                      </Button>
                    </SkillContactPopover>}
                </div>)}
            </div>}
        </div>
      </div>
    </SheetContent>;
};
export default SkillSheetContent;