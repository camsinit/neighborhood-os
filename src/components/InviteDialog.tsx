
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

const InviteDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [email, setEmail] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const { toast } = useToast();
  const user = useUser();
  const { currentNeighborhood, isLoading, error } = useNeighborhood();

  // Debug log when component renders
  console.log("[InviteDialog] Render state:", {
    user: !!user,
    currentNeighborhood,
    isLoading,
    error,
    isGeneratingLink
  });

  const generateAndCopyLink = async () => {
    if (!user || !currentNeighborhood) {
      console.log("[InviteDialog] Cannot generate link:", { user: !!user, currentNeighborhood });
      return;
    }
    
    setIsGeneratingLink(true);
    try {
      const inviteCode = crypto.randomUUID();
      
      console.log("[InviteDialog] Generating invite for neighborhood:", currentNeighborhood.id);
      
      const { error } = await supabase.from("invitations").insert({
        invite_code: inviteCode,
        inviter_id: user.id,
        neighborhood_id: currentNeighborhood.id,
      });

      if (error) throw error;

      const inviteUrl = `${window.location.origin}/join/${inviteCode}`;
      await navigator.clipboard.writeText(inviteUrl);
      
      toast({
        title: "Invite link copied!",
        description: "You can now share this link with your neighbor.",
      });
    } catch (error: any) {
      console.error("[InviteDialog] Error generating invite:", error);
      toast({
        title: "Error generating invite link",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const sendEmailInvite = async () => {
    toast({
      title: "Coming soon!",
      description: "Email invitations will be implemented with Resend.",
    });
    setEmail("");
  };

  if (isLoading) {
    console.log("[InviteDialog] Still loading...");
    return null;
  }

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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteDialog;
