
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Mail } from "lucide-react";
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
 * Allows users to generate invite links or send email invitations to neighbors.
 * Simple interface focused on getting people connected to the neighborhood.
 */
const UnifiedInviteDialog = ({
  open,
  onOpenChange
}: UnifiedInviteDialogProps) => {
  // State for tracking operations
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

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
        neighborhood_id: currentNeighborhood.id
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
      toast.success(`Invitation sent to ${email}! They'll receive an email with instructions to join.`);
      onOpenChange(false);
    } catch (error: any) {
      console.error("[UnifiedInviteDialog] Error sending email invite:", error);
      toast.error("Failed to send email invitation. Please try again.");
    } finally {
      setIsSendingEmail(false);
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
      <DialogContent className="w-[600px] h-[500px]">
        <DialogHeader>
          <DialogTitle>
            Invite Someone to {currentNeighborhood?.name || 'Your Neighborhood'}
          </DialogTitle>
          <DialogDescription>
            Share your neighborhood with others by sending them an invite link or emailing them directly.
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
            <Tabs defaultValue="generate" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="generate" className="flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  Generate Link
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Invite
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="generate" className="mt-6">
                <div className="text-center space-y-4">
                  {/* Main action button for link generation */}
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
                    <p>Click the button above to create a unique invite link that you can share with potential neighbors.</p>
                    <p>The link will be automatically copied to your clipboard for easy sharing.</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="email" className="mt-6">
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="font-semibold text-lg mb-2">Send Email Invitation</h3>
                    <p className="text-sm text-gray-600">
                      Enter your neighbor's email address and we'll send them a personalized invitation to join.
                    </p>
                  </div>
                  
                  {/* Email input form */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="neighbor@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError(''); // Clear error when typing
                      }}
                      className={emailError ? "border-red-300" : ""}
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
                    <Mail className="mr-2 h-5 w-5" />
                    {isSendingEmail ? "Sending..." : "Send Email Invitation"}
                  </Button>
                  
                  {/* Additional info */}
                  <div className="text-xs text-gray-500 text-center">
                    <p>They'll receive an email with your name and a link to join {currentNeighborhood.name}.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedInviteDialog;
