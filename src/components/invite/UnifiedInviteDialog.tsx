
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Mail, Link, Send } from "lucide-react";
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
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.includes('lovableproject.com');

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
 * Clean, focused interface for inviting neighbors via email or shareable link.
 * Combines both methods in a single view for better UX.
 */
const UnifiedInviteDialog = ({
  open,
  onOpenChange
}: UnifiedInviteDialogProps) => {
  // State for tracking operations and form data
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Get required hooks for user and neighborhood context
  const user = useUser();
  const { currentNeighborhood } = useNeighborhood();

  /**
   * Generates a unique invitation link and copies it to clipboard
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
        neighborhood_id: currentNeighborhood.id
      });
      
      if (error) throw error;

      // Create the invitation URL using the correct base URL
      const baseUrl = getBaseUrl();
      const inviteUrl = `${baseUrl}/join/${inviteCode}`;
      console.log("[UnifiedInviteDialog] Generated invite URL:", inviteUrl);

      // Copy the URL to clipboard
      await navigator.clipboard.writeText(inviteUrl);

      // Show success message
      toast.success("Invite link copied to clipboard!");
    } catch (error: any) {
      console.error("[UnifiedInviteDialog] Error generating invite:", error);
      toast.error("Failed to generate invite link. Please try again.");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  /**
   * Sends an email invitation to the specified email address
   */
  const sendEmailInvite = async () => {
    // Clear previous errors
    setEmailError('');
    
    // Validate email input
    if (!email.trim()) {
      setEmailError('Email address is required');
      return;
    }
    
    if (!email.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    // Validate required data is present
    if (!user || !currentNeighborhood) {
      toast.error("Unable to send invite. Please make sure you're logged in and part of a neighborhood.");
      return;
    }
    
    setIsSendingEmail(true);
    try {
      // Generate a unique invite code for this email invitation
      const inviteCode = crypto.randomUUID();
      console.log("[UnifiedInviteDialog] Generating email invite for neighborhood:", currentNeighborhood.id);

      // Create a new invitation record in the database with email
      const { error: inviteError } = await supabase.from("invitations").insert({
        invite_code: inviteCode,
        inviter_id: user.id,
        neighborhood_id: currentNeighborhood.id,
        email: email.trim()
      });
      
      if (inviteError) throw inviteError;

      // Create the invitation URL
      const baseUrl = getBaseUrl();
      const inviteUrl = `${baseUrl}/join/${inviteCode}`;

      // Send the email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-neighbor-invite', {
        body: {
          recipientEmail: email.trim(),
          inviterName: user.user_metadata?.display_name || user.email,
          neighborhoodName: currentNeighborhood.name,
          inviteUrl: inviteUrl
        }
      });

      if (emailError) throw emailError;

      // Success! Clear form and show message
      setEmail('');
      toast.success(`Invitation sent to ${email}!`);
    } catch (error: any) {
      console.error("[UnifiedInviteDialog] Error sending email invite:", error);
      toast.error("Failed to send email invitation. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  /**
   * Handles closing the dialog and resetting form state
   */
  const handleClose = () => {
    setEmail('');
    setEmailError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[600px] h-[500px]">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl">
            Invite to {currentNeighborhood?.name || 'Your Neighborhood'}
          </DialogTitle>
          <DialogDescription>
            Invite your neighbors to join and connect with your community.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 py-6 px-2">
          {/* Check if user has a neighborhood */}
          {!currentNeighborhood ? (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
              <p className="text-sm text-yellow-800">
                You need to be part of a neighborhood before you can invite others.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Email Invite Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Send Email Invitation</h3>
                    <p className="text-sm text-gray-600">
                      Send a personalized invite directly to their inbox
                    </p>
                  </div>
                </div>
                
                {/* Email input form */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="neighbor@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError(''); // Clear error when typing
                      }}
                      className={emailError ? "border-red-300 focus:border-red-500" : ""}
                    />
                    {/* Show inline error for email validation */}
                    {emailError && (
                      <p className="text-sm text-red-600">{emailError}</p>
                    )}
                  </div>

                  {/* Send button */}
                  <Button 
                    onClick={sendEmailInvite} 
                    disabled={isSendingEmail || !email.trim()} 
                    className="w-full"
                    size="lg"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isSendingEmail ? "Sending..." : "Send Invitation"}
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">or</span>
                </div>
              </div>

              {/* Copy Link Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Link className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Copy Invite Link</h3>
                    <p className="text-sm text-gray-600">
                      Generate a link to share however you'd like
                    </p>
                  </div>
                </div>
                
                {/* Generate link button */}
                <Button 
                  onClick={generateAndCopyLink} 
                  disabled={isGeneratingLink} 
                  variant="outline"
                  className="w-full" 
                  size="lg"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {isGeneratingLink ? "Generating..." : "Copy Invite Link"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedInviteDialog;
