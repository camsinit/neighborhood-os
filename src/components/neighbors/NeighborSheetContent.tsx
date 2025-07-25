import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, MapPin, Mail, Phone, Calendar, Users, Home } from "lucide-react";
import { format } from "date-fns";
import { UserWithRole } from "@/types/roles";
import { useUser } from '@supabase/auth-helpers-react';
import NeighborActivityTimeline from './NeighborActivityTimeline';

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

  // Function to close the sheet
  const handleSheetClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <SheetContent className="sm:max-w-md overflow-y-auto">
      <SheetHeader className="mb-4">
        <SheetTitle className="text-xl font-bold flex justify-between items-start">
          <span>{neighbor.profiles?.display_name || 'Neighbor'}</span>
          <div className="flex items-center gap-2">
            {/* Share functionality could be added here if needed */}
          </div>
        </SheetTitle>
      </SheetHeader>

      <div className="space-y-6">
        {/* Enhanced Profile Section with Purple Accents */}
        <div 
          className="p-6 rounded-xl border-2"
          style={{ 
            background: 'linear-gradient(135deg, hsl(var(--neighbors-light)) 0%, hsl(var(--background)) 100%)',
            borderColor: 'hsl(var(--neighbors-color) / 0.2)'
          }}
        >
          {/* Dynamic Layout: Avatar + Info Side by Side */}
          <div className="flex items-start gap-6 mb-6">
            {/* Avatar Section */}
            <div className="flex-shrink-0">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage src={neighbor.profiles?.avatar_url || ''} />
                  <AvatarFallback 
                    className="text-2xl"
                    style={{ backgroundColor: 'hsl(var(--neighbors-color) / 0.1)', color: 'hsl(var(--neighbors-color))' }}
                  >
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                {/* Purple accent ring */}
                <div 
                  className="absolute inset-0 rounded-full border-2 opacity-20"
                  style={{ borderColor: 'hsl(var(--neighbors-color))' }}
                />
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 min-w-0">
              <div className="space-y-3">
                {/* Name and You Badge */}
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {neighbor.profiles?.display_name || 'Neighbor'}
                  </h3>
                  {isCurrentUser && (
                    <span 
                      className="text-sm font-normal px-2 py-1 rounded-full"
                      style={{ 
                        backgroundColor: 'hsl(var(--neighbors-color) / 0.1)', 
                        color: 'hsl(var(--neighbors-color))' 
                      }}
                    >
                      You
                    </span>
                  )}
                </div>
                
                {/* Metadata Row */}
                <div className="flex items-center gap-4 flex-wrap text-sm">
                  {/* Join Date */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {format(new Date(neighbor.created_at || new Date()), 'MMM yyyy')}</span>
                  </div>

                  {/* Years lived here - prominent purple badge */}
                  {neighbor.profiles?.years_lived_here && (
                    <div 
                      className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                      style={{ 
                        backgroundColor: 'hsl(var(--neighbors-color))', 
                        color: 'white' 
                      }}
                    >
                      <Home className="h-4 w-4" />
                      {neighbor.profiles.years_lived_here} {neighbor.profiles.years_lived_here === 1 ? 'year' : 'years'} here
                    </div>
                  )}
                </div>

                {/* Email prominently displayed if visible */}
                {neighbor.profiles?.email_visible && neighbor.profiles?.email && (
                  <div 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium w-fit"
                    style={{ 
                      backgroundColor: 'hsl(var(--neighbors-color) / 0.05)', 
                      color: 'hsl(var(--neighbors-color))' 
                    }}
                  >
                    <Mail className="h-4 w-4" />
                    {neighbor.profiles.email}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio Section - Now integrated within the same card */}
          {neighbor.profiles?.bio && (
            <div className="border-t pt-4" style={{ borderColor: 'hsl(var(--neighbors-color) / 0.1)' }}>
              <h4 
                className="font-semibold text-base mb-3 flex items-center gap-2"
                style={{ color: 'hsl(var(--neighbors-color))' }}
              >
                <User className="w-4 h-4" />
                About
              </h4>
              <div 
                className="p-4 rounded-lg border"
                style={{ 
                  backgroundColor: 'hsl(var(--neighbors-color) / 0.02)', 
                  borderColor: 'hsl(var(--neighbors-color) / 0.1)' 
                }}
              >
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{neighbor.profiles.bio}</p>
              </div>
            </div>
          )}
        </div>

        {/* Activity Timeline */}
        <NeighborActivityTimeline 
          neighborId={neighbor.id} 
          neighborName={neighbor.profiles?.display_name || 'This neighbor'} 
        />

        {/* Contact Information */}
        {(neighbor.profiles?.phone_visible || neighbor.profiles?.address_visible) && (
          <div>
            <h3 
              className="font-semibold text-lg mb-3 flex items-center gap-2"
              style={{ color: 'hsl(var(--neighbors-color))' }}
            >
              <Mail className="w-5 h-5" />
              Contact Information
            </h3>
            <div className="space-y-3">
              {neighbor.profiles?.phone_visible && neighbor.profiles?.phone_number && (
                <div 
                  className="flex items-center gap-3 p-3 rounded-lg border"
                  style={{ 
                    backgroundColor: 'hsl(var(--neighbors-color) / 0.02)', 
                    borderColor: 'hsl(var(--neighbors-color) / 0.1)' 
                  }}
                >
                  <Phone 
                    className="h-4 w-4" 
                    style={{ color: 'hsl(var(--neighbors-color))' }} 
                  />
                  <span className="text-sm font-medium">{neighbor.profiles.phone_number}</span>
                </div>
              )}
              
              {neighbor.profiles?.address_visible && neighbor.profiles?.address && (
                <div 
                  className="flex items-center gap-3 p-3 rounded-lg border"
                  style={{ 
                    backgroundColor: 'hsl(var(--neighbors-color) / 0.02)', 
                    borderColor: 'hsl(var(--neighbors-color) / 0.1)' 
                  }}
                >
                  <MapPin 
                    className="h-4 w-4" 
                    style={{ color: 'hsl(var(--neighbors-color))' }} 
                  />
                  <span className="text-sm font-medium">{neighbor.profiles.address}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Access Needs */}
        {neighbor.profiles?.access_needs && (
          <div>
            <h3 
              className="font-semibold text-lg mb-3 flex items-center gap-2"
              style={{ color: 'hsl(var(--neighbors-color))' }}
            >
              <Users className="w-5 h-5" />
              Accessibility Notes
            </h3>
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: 'hsl(var(--neighbors-color) / 0.02)', 
                borderColor: 'hsl(var(--neighbors-color) / 0.1)' 
              }}
            >
              <p className="text-gray-700 text-sm leading-relaxed">{neighbor.profiles.access_needs}</p>
            </div>
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
      </div>
    </SheetContent>
  );
};

export default NeighborSheetContent;