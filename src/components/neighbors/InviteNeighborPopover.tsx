
import React, { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@supabase/auth-helpers-react';
import { useNeighborhood } from '@/contexts/NeighborhoodContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { UserPlus } from 'lucide-react';

/**
 * InviteNeighborPopover component
 * 
 * A streamlined UI for generating and sharing one-time invite codes
 * that neighbors can use to join the neighborhood.
 */
const InviteNeighborPopover = () => {
  // State for tracking the invite code and UI states
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  // Add a state to track errors for better display
  const [error, setError] = useState<string | null>(null);

  // Get required hooks
  const { toast } = useToast();
  const user = useUser();
  const { currentNeighborhood } = useNeighborhood();

  // Debug effect to track neighborhood data changes
  useEffect(() => {
    // Log when neighborhood data changes for debugging
    console.log("[InvitePopover] Neighborhood data updated:", {
      hasNeighborhood: !!currentNeighborhood,
      neighborhoodId: currentNeighborhood?.id,
      hasUser: !!user
    });
  }, [currentNeighborhood, user]);

  /**
   * Generates a new invite code and stores it in the database
   */
  const generateInviteCode = async () => {
    // Reset states at the beginning
    setIsCopied(false);
    setIsGenerating(true);
    setError(null); // Clear any previous errors
    
    try {
      // Validate required data is present with more detailed logging
      if (!user) {
        console.error("[InvitePopover] Cannot generate invite: No user is logged in");
        setError("You must be logged in to generate invites");
        throw new Error("You must be logged in to generate invites");
      }
      
      if (!currentNeighborhood) {
        console.error("[InvitePopover] Cannot generate invite: No neighborhood selected");
        setError("You need to join a neighborhood before inviting others");
        throw new Error("No neighborhood selected");
      }
      
      // Generate a unique UUID for the invite
      const newInviteCode = crypto.randomUUID();
      
      console.log("[InvitePopover] Generating invite for neighborhood:", {
        neighborhoodId: currentNeighborhood.id,
        neighborhoodName: currentNeighborhood.name,
        userId: user.id
      });
      
      // Create a new invitation record in the database
      const { error: dbError } = await supabase.from("invitations").insert({
        invite_code: newInviteCode,
        inviter_id: user.id,
        neighborhood_id: currentNeighborhood.id,
      });

      // Handle database errors
      if (dbError) {
        console.error("[InvitePopover] Database error:", dbError);
        setError("Unable to create invitation in database");
        throw dbError;
      }

      // Update state with the new code
      setInviteCode(newInviteCode);
      
      // Show success message
      toast({
        title: "Invite code generated!",
        description: "You can now share this code with your neighbor.",
      });
    } catch (error: any) {
      // Log and handle any errors
      console.error("[InvitePopover] Error generating invite:", error);
      
      // Don't show toast for expected errors (no neighborhood/user)
      if (!error.message.includes("No neighborhood") && 
          !error.message.includes("logged in")) {
        toast({
          title: "Error generating invite code",
          description: error.message || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } finally {
      // End the generation process
      setIsGenerating(false);
    }
  };

  /**
   * Copies the complete invitation URL to clipboard
   */
  const copyInviteLink = async () => {
    try {
      if (!inviteCode) return;
      
      // Create the full invitation URL
      const inviteUrl = `${window.location.origin}/join/${inviteCode}`;
      
      // Copy the URL to clipboard
      await navigator.clipboard.writeText(inviteUrl);
      
      // Show success feedback
      setIsCopied(true);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
      
      // Show success message
      toast({
        title: "Invite link copied!",
        description: "You can now share this link with your neighbor.",
      });
    } catch (error: any) {
      console.error("[InvitePopover] Error copying invite link:", error);
      toast({
        title: "Error copying link",
        description: "Could not copy the link to clipboard",
        variant: "destructive",
      });
    }
  };

  /**
   * Handle popover open change - generate new code automatically
   */
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    
    // When opening, clear any previous errors
    if (open) {
      setError(null);
    }
    
    // Only try to generate a code if we have both user and neighborhood data
    if (open && !inviteCode && !isGenerating) {
      if (user && currentNeighborhood) {
        generateInviteCode();
      }
    }
  };
  
  // Determine if button should be disabled
  const isButtonDisabled = !inviteCode || isGenerating || !currentNeighborhood;

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-base font-medium"
          type="button"
          aria-label="Invite a neighbor"
        >
          <UserPlus className="h-5 w-5" />
          Invite Neighbor
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-4">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-medium text-lg">Invite a Neighbor</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Share this link with someone to invite them to your neighborhood
            </p>
          </div>
          
          {/* Show neighborhood name if available */}
          {currentNeighborhood && (
            <div className="text-center">
              <span className="text-sm font-medium">
                {currentNeighborhood.name}
              </span>
            </div>
          )}
          
          {/* Error state when no neighborhood or other errors */}
          {(error || !currentNeighborhood) && !isGenerating && (
            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-yellow-800">
                  {error || "You need to join a neighborhood before inviting others."}
                </p>
              </div>
            </div>
          )}
          
          {/* Loading state */}
          {isGenerating && (
            <div className="py-2 flex justify-center">
              <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}
          
          {/* Display the invite code */}
          {inviteCode && !isGenerating && (
            <div className="mt-2">
              <Button
                variant="outline"
                className="w-full justify-center gap-2"
                onClick={copyInviteLink}
                disabled={isButtonDisabled}
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Invite Link
                  </>
                )}
              </Button>
              <p className="text-xs text-center mt-2 text-muted-foreground">
                This is a one-time use link that expires after use
              </p>
            </div>
          )}
          
          {/* Button to generate a new code */}
          {inviteCode && !isGenerating && (
            <Button
              variant="ghost"
              size="sm"
              onClick={generateInviteCode}
              disabled={isGenerating}
              className="w-full text-sm"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Generate New Code
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default InviteNeighborPopover;
