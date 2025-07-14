import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MapPin, Calendar, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { useUser } from '@supabase/auth-helpers-react';

/**
 * Interface for neighborhood data in preview mode
 */
interface NeighborhoodData {
  id: string;
  name: string;
  city?: string;
  state?: string;
  created_at: string;
  memberCount: number;
}

/**
 * Props for the InvitePreview component
 */
interface InvitePreviewProps {
  neighborhood: NeighborhoodData;
  /** Whether to show in preview mode (read-only) or interactive mode */
  previewMode?: boolean;
  /** Optional className for styling */
  className?: string;
}

/**
 * InvitePreview Component
 * 
 * Shows the neighborhood invitation preview that users will see when they click an invite link.
 * Can be used in preview mode for admin/creator interfaces or interactive mode for actual invites.
 * 
 * This component extracts the UI logic from JoinPage to be reusable in different contexts.
 */
const InvitePreview: React.FC<InvitePreviewProps> = ({ 
  neighborhood, 
  previewMode = false,
  className = ""
}) => {
  // Get current user for determining button state
  const user = useUser();
  
  // Local state for interactive mode
  const [isJoining, setIsJoining] = useState(false);

  /**
   * Handle joining the neighborhood (only in interactive mode)
   */
  const handleJoinNeighborhood = () => {
    if (previewMode) return;
    
    // In a real implementation, this would call the join logic
    setIsJoining(true);
    setTimeout(() => {
      setIsJoining(false);
    }, 2000);
  };

  /**
   * Handle new user signup (only in interactive mode)
   */
  const handleNewUserSignup = () => {
    if (previewMode) return;
    
    // In a real implementation, this would navigate to onboarding
    console.log("Navigate to onboarding with invite");
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <CardDescription className="mb-2">
            You've been invited to join the
          </CardDescription>
          <CardTitle className="text-2xl">{neighborhood.name} neighborhood</CardTitle>
          
          {/* Preview mode indicator */}
          {previewMode && (
            <div className="flex items-center justify-center gap-2 mt-2 text-sm text-blue-600 bg-blue-50 rounded-md px-3 py-1">
              <Eye className="h-4 w-4" />
              <span>Preview Mode</span>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Neighborhood Preview Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-600">
              <MapPin className="h-5 w-5" />
              <span>
                {neighborhood.city && neighborhood.state 
                  ? `${neighborhood.city}, ${neighborhood.state}`
                  : 'Location not specified'
                }
              </span>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-600">
              <Users className="h-5 w-5" />
              <span>{neighborhood.memberCount || 0} members</span>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-600">
              <Calendar className="h-5 w-5" />
              <span>
                Created {neighborhood.created_at 
                  ? new Date(neighborhood.created_at).toLocaleDateString()
                  : 'recently'
                }
              </span>
            </div>
          </div>

          {/* Join Button */}
          <div className="space-y-3">
            {user && !previewMode ? (
              // Existing user - can join directly (only in interactive mode)
              <Button 
                onClick={handleJoinNeighborhood}
                disabled={isJoining}
                className="w-full"
                size="lg"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                {isJoining ? 'Joining...' : `Join ${neighborhood.name}`}
              </Button>
            ) : (
              // New user or preview mode
              <div className="space-y-2">
                <Button 
                  onClick={handleNewUserSignup}
                  className="w-full"
                  size="lg"
                  disabled={previewMode}
                  variant={previewMode ? "outline" : "default"}
                >
                  Join Neighborhood
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  {previewMode 
                    ? "This is how the invite will appear to recipients"
                    : "You'll create an account and set up your profile to join"
                  }
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              By joining, you'll be able to connect with your neighbors and participate in community activities.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitePreview;
