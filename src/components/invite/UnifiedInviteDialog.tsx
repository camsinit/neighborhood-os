import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useNeighborhood } from "@/contexts/NeighborhoodContext";

/**
 * Props for the UnifiedInviteDialog component
 */
interface UnifiedInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Get the correct base URL for invite links
 * Uses production domain in production, fallback to current origin for development
 */
const getBaseUrl = (): string => {
  // Check if we're in development/preview environment
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('lovableproject.com');
  
  // If we're in development/preview, use the current origin for testing
  if (isDevelopment) {
    return window.location.origin;
  }
  
  // Otherwise, we're in production - use the production domain
  return 'https://neighborhoodos.com';
};

/**
 * UnifiedInviteDialog Component
 * 
 * Simplified invite system that only generates and copies invite links.
 * No need for neighbor information - just click and share!
 */
const UnifiedInviteDialog = ({ open, onOpenChange }: UnifiedInviteDialogProps) => {
  // State for tracking link generation
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  
  // Get required hooks for user and neighborhood context
  const user = useUser();
  const { currentNeighborhood } = useNeighborhood();

  /**
   * Generates a unique invitation link and copies it to clipboard
   * Uses the correct production domain for invite URLs
   */
  const generateAndCopyLink = async () => {
    // Validate required data is present
    if (!user || !currentNeighborhood) {
      toast.error("Unable to generate invite link. Please make sure you're logged in and part of a neighborhood.");
      return;
    }
    
    setIsGeneratingLink(true);
    try {
      // Generate a unique invite code using crypto.randomUUID()
      const inviteCode = crypto.randomUUID();
      
      console.log("[UnifiedInviteDialog] Generating invite for neighborhood:", currentNeighborhood.id);
      
      // Create a new invitation record in the database
      const { error } = await supabase.from("invitations").insert({
        invite_code: inviteCode,
        inviter_id: user.id,
        neighborhood_id: currentNeighborhood.id,
      });

      if (error) throw error;

      // Create the invitation URL using the correct base URL
      const baseUrl = getBaseUrl();
      const inviteUrl = `${baseUrl}/join/${inviteCode}`;
      
      console.log("[UnifiedInviteDialog] Generated invite URL:", inviteUrl);
      
      // Copy the URL to clipboard
      await navigator.clipboard.writeText(inviteUrl);
      
      // Show success message and close dialog
      toast.success("Invite link copied to clipboard! Share it with your neighbor.");
      onOpenChange(false);
      
    } catch (error: any) {
      console.error("[UnifiedInviteDialog] Error generating invite:", error);
      toast.error("Failed to generate invite link. Please try again.");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  /**
   * Handles closing the dialog
   */
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            Invite Someone to {currentNeighborhood?.name || 'Your Neighborhood'}
          </DialogTitle>
          <DialogDescription>
            Generate a unique invite link that you can share with anyone you'd like to invite to your neighborhood.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          {/* Check if user has a neighborhood */}
          {!currentNeighborhood ? (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
              <p className="text-sm text-yellow-800">
                You need to be part of a neighborhood before you can invite others.
              </p>
            </div>
          ) : (
            <div className="text-center space-y-4">
              {/* Main action button */}
              <Button
                onClick={generateAndCopyLink}
                disabled={isGeneratingLink}
                className="w-full"
                size="lg"
              >
                <Copy className="mr-2 h-5 w-5" />
                {isGeneratingLink ? "Generating Link..." : "Generate & Copy Invite Link"}
              </Button>
              
              {/* Instructions */}
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  Click the button above to create a unique invite link for {currentNeighborhood.name}.
                </p>
                <p>
                  Share the link via text, email, or any messaging app. When someone clicks it, they'll be able to join your neighborhood directly.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedInviteDialog;
