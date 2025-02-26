
import {
  Dialog,
  DialogContent,
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

// Component for displaying the invite dialog
const InviteDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [email, setEmail] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const { toast } = useToast();
  const user = useUser();
  const { currentNeighborhood, isLoading } = useNeighborhood();

  // Function to generate and copy invite link
  const generateAndCopyLink = async () => {
    if (!user || !currentNeighborhood) return;
    
    setIsGeneratingLink(true);
    try {
      // Generate a unique invite code
      const inviteCode = crypto.randomUUID();
      
      // Create invitation record in the database
      const { error } = await supabase.from("invitations").insert({
        invite_code: inviteCode,
        inviter_id: user.id,
        neighborhood_id: currentNeighborhood.id,
      });

      if (error) throw error;

      // Create the full invite URL
      const inviteUrl = `${window.location.origin}/join/${inviteCode}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(inviteUrl);
      
      toast({
        title: "Invite link copied!",
        description: "You can now share this link with your neighbor.",
      });
    } catch (error: any) {
      toast({
        title: "Error generating invite link",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingLink(false);
    }
  };

  // Function to send email invite (to be implemented with Resend)
  const sendEmailInvite = async () => {
    toast({
      title: "Coming soon!",
      description: "Email invitations will be implemented with Resend.",
    });
    setEmail("");
  };

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Invite a Neighbor to {currentNeighborhood?.name || 'Your Neighborhood'}
          </DialogTitle>
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
              {isGeneratingLink ? "Generating..." : "Generate and copy link"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteDialog;
