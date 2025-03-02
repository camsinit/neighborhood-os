
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useNeighborhood } from "@/contexts/NeighborhoodContext";
import GodModeSelector from "@/components/neighbors/GodModeSelector";

/**
 * InviteDialog Component
 * 
 * This component allows existing neighborhood members to invite others.
 * It generates unique invite codes tied to both the neighborhood and the inviter.
 */
const InviteDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  // State for the email input and link generation process
  const [email, setEmail] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  
  // Get required hooks
  const { toast } = useToast();
  const user = useUser();
  const { currentNeighborhood, isLoading, error, isCoreContributor } = useNeighborhood();

  // Debug log when component renders
  console.log("[InviteDialog] Render state:", {
    user: !!user,
    currentNeighborhood,
    isLoading,
    error,
    isGeneratingLink,
    isCoreContributor
  });

  /**
   * Generates a unique invitation link and copies it to clipboard
   */
  const generateAndCopyLink = async () => {
    // Validate required data is present
    if (!user || !currentNeighborhood) {
      console.log("[InviteDialog] Cannot generate link:", { user: !!user, currentNeighborhood });
      
      // Show error message if no neighborhood
      if (!currentNeighborhood) {
        toast({
          title: "No neighborhood available",
          description: "You need to be part of a neighborhood to invite others.",
          variant: "destructive"
        });
      }
      return;
    }
    
    // Start the link generation process
    setIsGeneratingLink(true);
    try {
      // Generate a unique UUID for the invite
      const inviteCode = crypto.randomUUID();
      
      console.log("[InviteDialog] Generating invite for neighborhood:", currentNeighborhood.id);
      
      // Create a new invitation record in the database
      const { error } = await supabase.from("invitations").insert({
        invite_code: inviteCode,
        inviter_id: user.id,
        neighborhood_id: currentNeighborhood.id,
      });

      // Handle database errors
      if (error) throw error;

      // Create the full invitation URL
      const inviteUrl = `${window.location.origin}/join/${inviteCode}`;
      
      // Copy the URL to clipboard
      await navigator.clipboard.writeText(inviteUrl);
      
      // Show success message
      toast({
        title: "Invite link copied!",
        description: "You can now share this link with your neighbor.",
      });
    } catch (error: any) {
      // Log and handle any errors
      console.error("[InviteDialog] Error generating invite:", error);
      toast({
        title: "Error generating invite link",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      // End the generation process
      setIsGeneratingLink(false);
    }
  };

  /**
   * Sends an email invitation (placeholder for future implementation)
   */
  const sendEmailInvite = async () => {
    // Validate email input is not empty
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate neighborhood exists
    if (!currentNeighborhood) {
      toast({
        title: "No neighborhood available",
        description: "You need to be part of a neighborhood to invite others.",
        variant: "destructive"
      });
      return;
    }
    
    // Show a message that this feature is coming soon
    toast({
      title: "Coming soon!",
      description: "Email invitations will be implemented with Resend.",
    });
    setEmail("");
  };

  // Don't render anything while loading
  if (isLoading) {
    console.log("[InviteDialog] Still loading...");
    return null;
  }

  // Log error state if any
  if (error) {
    console.error("[InviteDialog] Error state:", error);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Invite a Neighbor to {currentNeighborhood?.name || 'Your Neighborhood'}
          </DialogTitle>
          <DialogDescription>
            Invite your neighbors to join your neighborhood community. You can send them an email invitation or share a direct link.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* If no neighborhood, show message */}
          {!currentNeighborhood && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
              <p className="text-sm text-yellow-800">
                You need to be part of a neighborhood before you can invite others.
                Please use an invitation link from an existing member to join a neighborhood.
              </p>
            </div>
          )}
          
          {/* Only show invitation options if user has a neighborhood */}
          {currentNeighborhood && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="email">Email invite</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="neighbor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button onClick={sendEmailInvite} size="icon">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Share invite link</Label>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={generateAndCopyLink}
                  disabled={isGeneratingLink || !currentNeighborhood}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {isGeneratingLink 
                    ? "Generating..." 
                    : !currentNeighborhood 
                      ? "No neighborhood available" 
                      : "Generate and copy link"}
                </Button>
              </div>
            </>
          )}
          
          {/* Only show God Mode if user is a core contributor */}
          {isCoreContributor && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-center">
                <GodModeSelector />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                As a core contributor, you can access all neighborhoods in God Mode.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteDialog;
