
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Mail, Send } from "lucide-react";
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
 * UnifiedInviteDialog Component
 * 
 * A single, consolidated component for inviting neighbors to join your neighborhood.
 * Replaces all the previous invite components with a clean, simple interface.
 */
const UnifiedInviteDialog = ({ open, onOpenChange }: UnifiedInviteDialogProps) => {
  // Form state for neighbor's information
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // Get required hooks for user and neighborhood context
  const user = useUser();
  const { currentNeighborhood } = useNeighborhood();

  /**
   * Generates a unique invitation link and copies it to clipboard
   * Uses the standardized URL pattern: /join/{inviteCode}
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

      // Create the standardized invitation URL: /join/{inviteCode}
      const inviteUrl = `${window.location.origin}/join/${inviteCode}`;
      
      // Copy the URL to clipboard
      await navigator.clipboard.writeText(inviteUrl);
      
      // Show success message
      toast.success("Invite link copied to clipboard! Share it with your neighbor.");
      
      // Clear the form
      setFirstName("");
      setEmail("");
    } catch (error: any) {
      console.error("[UnifiedInviteDialog] Error generating invite:", error);
      toast.error("Failed to generate invite link. Please try again.");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  /**
   * Sends an email invitation (placeholder for Phase 2)
   * Will be implemented with Resend integration in the next phase
   */
  const sendEmailInvite = async () => {
    // Validate required fields
    if (!firstName.trim()) {
      toast.error("Please enter your neighbor's first name.");
      return;
    }
    
    if (!email.trim() || !email.includes('@')) {
      toast.error("Please enter a valid email address.");
      return;
    }
    
    if (!currentNeighborhood) {
      toast.error("Unable to send invite. Please make sure you're part of a neighborhood.");
      return;
    }
    
    setIsSendingEmail(true);
    
    // For now, show a placeholder message
    // This will be replaced with actual email functionality in Phase 2
    setTimeout(() => {
      toast.success(`Email invitation feature coming soon! For now, use the "Copy Link" button to share with ${firstName}.`);
      setIsSendingEmail(false);
    }, 1000);
  };

  /**
   * Clears the form and closes the dialog
   */
  const handleClose = () => {
    setFirstName("");
    setEmail("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Invite a Neighbor to {currentNeighborhood?.name || 'Your Neighborhood'}
          </DialogTitle>
          <DialogDescription>
            Invite someone to join your neighborhood community. You can share a link or send them an email invitation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Check if user has a neighborhood */}
          {!currentNeighborhood ? (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
              <p className="text-sm text-yellow-800">
                You need to be part of a neighborhood before you can invite others.
              </p>
            </div>
          ) : (
            <>
              {/* First Name Field */}
              <div className="grid gap-2">
                <Label htmlFor="firstName">Neighbor's First Name</Label>
                <Input
                  id="firstName"
                  placeholder="e.g., Sarah"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Email Field */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="neighbor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid gap-2 pt-4">
                {/* Send Email Button (Phase 2 feature) */}
                <Button
                  onClick={sendEmailInvite}
                  disabled={isSendingEmail || !firstName.trim() || !email.trim()}
                  className="w-full"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {isSendingEmail ? "Sending..." : "Send Email Invitation"}
                </Button>
                
                {/* Copy Link Button */}
                <Button
                  variant="outline"
                  onClick={generateAndCopyLink}
                  disabled={isGeneratingLink}
                  className="w-full"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {isGeneratingLink ? "Generating..." : "Copy Invite Link"}
                </Button>
              </div>

              {/* Helper Text */}
              <p className="text-xs text-gray-500 mt-2">
                The invite link will allow {firstName || 'your neighbor'} to join {currentNeighborhood.name} directly.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedInviteDialog;
