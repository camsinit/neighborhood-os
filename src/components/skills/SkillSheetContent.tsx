
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import ModuleButton from "@/components/ui/module-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";

import ShareButton from "@/components/ui/share-button";
import { SkillCategory } from "./types/skillTypes";
import { useSkillProviders, SkillProvider } from "./hooks/useSkillProviders";
import { ContactMethodDisplay } from "./components/ContactMethodDisplay";
import SkillRequestSheet from "./SkillRequestSheet";

/**
 * SkillSheetContent - Displays detailed skill information in a side sheet
 * 
 * Shows skill details, all neighbors who offer this skill, and action buttons
 * for "Have this skill?" and "Contact" functionality.
 * 
 * Updated to show ALL providers including current user for transparency
 */
interface SkillSheetContentProps {
  skillTitle: string;
  skillCategory: SkillCategory;
  onOpenChange?: (open: boolean) => void;
}

const SkillSheetContent = ({
  skillTitle,
  skillCategory,
  onOpenChange
}: SkillSheetContentProps) => {
  const user = useUser();
  const [userHasSkill, setUserHasSkill] = useState(false);
  // Store neighborhood ID for sharing functionality
  const [neighborhoodId, setNeighborhoodId] = useState<string>('');
  // Track which provider's contact info is revealed
  const [revealedContactId, setRevealedContactId] = useState<string | null>(null);
  // State for Request Skill sheet
  const [isRequestSheetOpen, setIsRequestSheetOpen] = useState(false);

  // Use the hook to fetch skill providers with contact info (now includes current user)
  const { data: providers = [], isLoading: loading } = useSkillProviders(skillTitle, skillCategory);

  // Function to close the sheet
  const handleSheetClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  // Handle contact button click
  const handleContactClick = (providerId: string) => {
    setRevealedContactId(revealedContactId === providerId ? null : providerId);
  };

  // Get neighborhood ID from first provider or fetch separately
  useEffect(() => {
    const getNeighborhoodId = async () => {
      if (!user) return;
      try {
        const { data: userNeighborhood } = await supabase
          .from('neighborhood_members')
          .select('neighborhood_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();
        if (userNeighborhood) {
          setNeighborhoodId(userNeighborhood.neighborhood_id);
        }
      } catch (error) {
        console.error('Error fetching neighborhood ID:', error);
      }
    };
    getNeighborhoodId();
  }, [user]);

  // Check if current user offers this skill (now that we include all providers)
  useEffect(() => {
    if (providers.length > 0 && user) {
      setUserHasSkill(providers.some(p => p.user_id === user.id));
    }
  }, [providers, user]);

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

  // Handle "Remove myself from this skill" button click
  const handleRemoveSkill = async () => {
    if (!user) return;
    try {
      // Remove user's skill offer for this specific skill title and category
      const { error } = await supabase
        .from('skills_exchange')
        .delete()
        .eq('user_id', user.id)
        .eq('title', skillTitle)
        .eq('skill_category', skillCategory)
        .eq('request_type', 'offer');
        
      if (error) throw error;

      // Update local state
      setUserHasSkill(false);
      // The useSkillProviders hook will automatically refetch
      window.location.reload(); // Simple refresh to update providers
    } catch (error) {
      console.error('Error removing skill:', error);
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
            <ShareButton contentType="skills" contentId={skillTitle || ''} neighborhoodId={neighborhoodId} size="sm" variant="ghost" />
          </div>
        </SheetTitle>
      </SheetHeader>

      <div className="space-y-6">
        {/* Skill overview - now shows accurate count including current user */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Skill Overview</h3>
          <p className="text-gray-600">
            {providers.length} neighbor{providers.length !== 1 ? 's' : ''} offer{providers.length === 1 ? 's' : ''} this skill in your area.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {/* Request Skill button - Always visible for users who don't have the skill */}
          {!userHasSkill && (
            <Button 
              onClick={() => setIsRequestSheetOpen(true)}
              variant="outline"
              className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <MessageSquare className="h-4 w-4" />
              Request This Skill
            </Button>
          )}
          
          {/* Have this skill / Remove skill buttons */}
          {!userHasSkill ? (
            <ModuleButton 
              onClick={handleAddSkill} 
              moduleTheme="skills"
              variant="filled"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Have this skill?
            </ModuleButton>
          ) : (
            <Button 
              onClick={handleRemoveSkill} 
              variant="outline" 
              className="flex items-center gap-2 border-red-500 text-red-600 hover:bg-red-50"
            >
              Remove myself from this skill
            </Button>
          )}
        </div>

        {/* Providers list - now includes current user with "(You)" indicator */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Neighbors with this skill</h3>
          {loading ? <div className="text-gray-500">Loading...</div> : providers.length === 0 ? <div className="text-gray-500">No neighbors currently offer this skill.</div> : <div className="space-y-4">
              {providers.map(provider => (
                <div key={provider.user_id} className="flex flex-col gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={provider.user_profiles?.avatar_url || undefined} />
                      <AvatarFallback>
                        {provider.user_profiles?.display_name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {provider.user_profiles?.display_name || 'Anonymous'}
                        {provider.user_id === user?.id && <span className="text-sm text-gray-500 font-normal"> (You)</span>}
                      </h4>
                      
                      {provider.skill_description && <p className="text-sm text-gray-600 mt-1">{provider.skill_description}</p>}
                      
                      {provider.time_preferences && provider.time_preferences.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Available: {provider.time_preferences.join(', ')}
                        </p>
                      )}
                    </div>
                    
                    {/* Only show Contact button for other users, not current user */}
                    {provider.user_id !== user?.id && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-green-500 text-green-600 hover:bg-green-50"
                        onClick={() => handleContactClick(provider.user_id)}
                      >
                        {revealedContactId === provider.user_id ? 'Hide Contact' : 'Contact'}
                      </Button>
                    )}
                  </div>
                  
                  {/* Contact info display - only for other users */}
                  {provider.user_id !== user?.id && (
                    <ContactMethodDisplay 
                      provider={provider} 
                      isRevealed={revealedContactId === provider.user_id} 
                    />
                  )}
                </div>
              ))}
            </div>}
        </div>
      </div>
      
      {/* Request Skill Sheet - Opens when user clicks "Request This Skill" */}
      <SkillRequestSheet 
        open={isRequestSheetOpen}
        onOpenChange={setIsRequestSheetOpen}
      />
    </SheetContent>;
};
export default SkillSheetContent;
