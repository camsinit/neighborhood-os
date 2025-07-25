import { Button } from "@/components/ui/button";
import { User, MapPin, Mail, Phone, Calendar, Users, Home, Copy } from "lucide-react";
import { format } from "date-fns";
import { UserWithRole } from "@/types/roles";
import { useUser } from '@supabase/auth-helpers-react';
import NeighborActivityTimeline from './NeighborActivityTimeline';
import { 
  EnhancedSheetContent, 
  ProfileCard, 
  SectionHeader, 
  ContentSection 
} from "@/components/ui/enhanced-sheet-content";

/**
 * NeighborSheetContent - Side panel component for displaying detailed neighbor profile information
 * 
 * This component shows comprehensive details about a neighbor including:
 * - Profile information (name, avatar, bio)
 * - Contact information (respecting privacy settings)
 * - Address information (if shared)
 * - Skills and interests
 * - Community activity and join date
 */
interface NeighborSheetContentProps {
  neighbor: UserWithRole;
  onOpenChange?: (open: boolean) => void;
}

const NeighborSheetContent = ({ neighbor, onOpenChange }: NeighborSheetContentProps) => {
  const currentUser = useUser();
  const isCurrentUser = currentUser?.id === neighbor.id;

  // Function to copy email to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here if desired
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Function to truncate email for display
  const truncateEmail = (email: string, maxLength: number = 25) => {
    if (email.length <= maxLength) return email;
    return email.slice(0, maxLength - 3) + '...';
  };

  // Function to close the sheet
  const handleSheetClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  // Prepare metadata for ProfileCard component
  const profileMetadata = [
    {
      icon: Calendar,
      text: `Joined ${format(new Date(neighbor.created_at || new Date()), 'MMM yyyy')}`,
      prominent: false
    },
    // Only include years lived here if it exists
    ...(neighbor.profiles?.years_lived_here ? [{
      icon: Home,
      text: `${neighbor.profiles.years_lived_here} ${neighbor.profiles.years_lived_here === 1 ? 'year' : 'years'} here`,
      prominent: true
    }] : [])
  ];

  return (
    <EnhancedSheetContent moduleTheme="neighbors">
      {/* Enhanced Profile Section using standardized ProfileCard */}
      <ProfileCard
        name={neighbor.profiles?.display_name || 'Neighbor'}
        avatarUrl={neighbor.profiles?.avatar_url || undefined}
        isCurrentUser={isCurrentUser}
        metadata={profileMetadata}
        moduleTheme="neighbors"
      >
        {/* Email prominently displayed if visible */}
        {neighbor.profiles?.email_visible && neighbor.profiles?.email && (
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium max-w-full mt-3"
            style={{ 
              backgroundColor: 'hsl(var(--neighbors-color) / 0.05)', 
              color: 'hsl(var(--neighbors-color))' 
            }}
          >
            <Mail className="h-4 w-4 flex-shrink-0" />
            <span className="truncate flex-1 min-w-0">
              {truncateEmail(neighbor.profiles.email)}
            </span>
            <button
              onClick={() => copyToClipboard(neighbor.profiles.email)}
              className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
              title="Copy email address"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
        )}
      </ProfileCard>

        {/* Activity Timeline */}
        <NeighborActivityTimeline 
          neighborId={neighbor.id} 
          neighborName={neighbor.profiles?.display_name || 'This neighbor'} 
        />

        {/* Contact Information using standardized components */}
        {(neighbor.profiles?.phone_visible || neighbor.profiles?.address_visible) && (
          <div>
            <SectionHeader
              title="Contact Information"
              icon={Mail}
              moduleTheme="neighbors"
            />
            <div className="space-y-3">
              {neighbor.profiles?.phone_visible && neighbor.profiles?.phone_number && (
                <ContentSection moduleTheme="neighbors">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-neighbors-color" />
                    <span className="text-sm font-medium">{neighbor.profiles.phone_number}</span>
                  </div>
                </ContentSection>
              )}
              
              {neighbor.profiles?.address_visible && neighbor.profiles?.address && (
                <ContentSection moduleTheme="neighbors">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-neighbors-color" />
                    <span className="text-sm font-medium">{neighbor.profiles.address}</span>
                  </div>
                </ContentSection>
              )}
            </div>
          </div>
        )}

        {/* Access Needs using standardized components */}
        {neighbor.profiles?.access_needs && (
          <div>
            <SectionHeader
              title="Accessibility Notes"
              icon={Users}
              moduleTheme="neighbors"
            />
            <ContentSection moduleTheme="neighbors">
              <p className="text-gray-700 text-sm leading-relaxed">{neighbor.profiles.access_needs}</p>
            </ContentSection>
          </div>
        )}

        {/* Action Buttons */}
        {!isCurrentUser && (
          <></>
        )}

        {isCurrentUser && (
          <div className="pt-6 border-t border-gray-200">
            <Button 
              variant="outline" 
              className="w-full border-2 font-medium"
              style={{ 
                borderColor: 'hsl(var(--neighbors-color))', 
                color: 'hsl(var(--neighbors-color))' 
              }}
            >
              Edit Profile
            </Button>
          </div>
        )}
    </EnhancedSheetContent>
  );
};

export default NeighborSheetContent;