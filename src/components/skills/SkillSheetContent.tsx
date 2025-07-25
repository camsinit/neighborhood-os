
import { Button } from "@/components/ui/button";
import ModuleButton from "@/components/ui/module-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Users, Star, Clock, Lightbulb, Copy, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  EnhancedSheetContent, 
  ProfileCard, 
  SectionHeader, 
  ContentSection 
} from "@/components/ui/enhanced-sheet-content";

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
  
  // Prepare metadata for the skill header
  const skillMetadata = [
    {
      icon: Users,
      text: `${providers.length} ${providers.length === 1 ? 'neighbor offers' : 'neighbors offer'} this skill`,
      prominent: true
    }
  ];

  // Prepare badges for the skill
  const skillBadges = [
    {
      text: skillCategory.charAt(0).toUpperCase() + skillCategory.slice(1),
      variant: 'secondary' as const
    }
  ];

  return (
    <EnhancedSheetContent moduleTheme="skills">
      {/* Enhanced Skill Header using standardized ProfileCard */}
      <ProfileCard
        name={skillTitle}
        avatarUrl={undefined} // Skills don't have avatars
        isCurrentUser={false}
        badges={skillBadges}
        metadata={skillMetadata}
        moduleTheme="skills"
      >
        {/* Additional actions in the profile area */}
        <div className="flex items-center gap-2 mt-3">
          <ShareButton 
            contentType="skills" 
            contentId={skillTitle || ''} 
            neighborhoodId={neighborhoodId} 
            size="sm" 
            variant="ghost" 
          />
        </div>
      </ProfileCard>

        {/* Skill Providers Section using standardized components */}
        <div>
          <SectionHeader
            title="Neighbors with this skill"
            icon={Users}
            moduleTheme="skills"
          />
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300 mx-auto mb-4"></div>
              Loading neighbors...
            </div>
          ) : providers.length === 0 ? (
            <ContentSection moduleTheme="skills" className="text-center py-8 border-2 border-dashed">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No neighbors currently offer this skill.</p>
              <p className="text-sm text-gray-400 mt-1">Be the first to share your expertise!</p>
            </ContentSection>
          ) : (
            <div className="space-y-3">
              {providers.map(provider => (
                <ContentSection 
                  key={provider.user_id} 
                  moduleTheme="skills"
                  className="p-3 transition-all duration-200 hover:shadow-md group border"
                >
                  {/* Compact Provider Layout */}
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-10 w-10 border border-white shadow-sm">
                        <AvatarImage src={provider.user_profiles?.avatar_url || undefined} />
                        <AvatarFallback 
                          style={{ 
                            backgroundColor: 'hsl(var(--skills-color) / 0.1)', 
                            color: 'hsl(var(--skills-color))' 
                          }}
                        >
                          {provider.user_profiles?.display_name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {provider.user_profiles?.display_name || 'Anonymous'}
                        </h4>
                        {provider.user_id === user?.id && (
                          <span 
                            className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: 'hsl(var(--skills-color) / 0.15)', 
                              color: 'hsl(var(--skills-color))' 
                            }}
                          >
                            You
                          </span>
                        )}
                        {provider.time_preferences && provider.time_preferences.length > 0 && (
                          <div 
                            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md ml-auto"
                            style={{ 
                              backgroundColor: 'hsl(var(--skills-color) / 0.08)', 
                              color: 'hsl(var(--skills-color))' 
                            }}
                          >
                            <Clock className="h-3 w-3" />
                            {provider.time_preferences.join(', ')}
                          </div>
                        )}
                      </div>
                      
                      {provider.skill_description && (
                        <p className="text-xs text-gray-600 leading-relaxed">{provider.skill_description}</p>
                      )}
                    </div>
                    
                    {/* Action buttons - Contact for others, Remove for current user */}
                    {provider.user_id !== user?.id ? (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-shrink-0 text-xs h-8"
                        style={{ 
                          borderColor: 'hsl(var(--skills-color))', 
                          color: 'hsl(var(--skills-color))' 
                        }}
                        onClick={() => handleContactClick(provider.user_id)}
                      >
                        {revealedContactId === provider.user_id ? 'Hide' : 'Contact'}
                      </Button>
                    ) : (
                      /* Green trash icon for current user to remove their skill */
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="flex-shrink-0 h-8 w-8 p-0 hover:bg-red-50"
                        style={{ 
                          color: 'hsl(var(--skills-color))' 
                        }}
                        onClick={handleRemoveSkill}
                        title="Remove this skill"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Contact Info Display */}
                  {provider.user_id !== user?.id && revealedContactId === provider.user_id && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <ContactMethodDisplay 
                        provider={provider} 
                        isRevealed={true} 
                      />
                    </div>
                  )}
                </ContentSection>
              ))}
            </div>
          )}
        </div>
      
      {/* Request Skill Sheet */}
      <SkillRequestSheet 
        open={isRequestSheetOpen}
        onOpenChange={setIsRequestSheetOpen}
      />
    </EnhancedSheetContent>
  );
};
export default SkillSheetContent;
