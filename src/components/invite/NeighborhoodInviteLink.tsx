import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // Updated import for toast
import { Copy, Check } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";

/**
 * Get the correct base URL for invite links
 * Uses production domain in production, fallback to current origin for development
 */
const getBaseUrl = (): string => {
  // Email/share links should always use the public production domain
  return 'https://neighborhoodos.com';
};

/**
 * NeighborhoodInviteLink component
 * 
 * Allows members to generate and share invite links for their neighborhood
 */
const NeighborhoodInviteLink = () => {
  const [inviteLink, setInviteLink] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();
  const neighborhood = useCurrentNeighborhood();
  
  /**
   * Generates a shareable invite link for the current neighborhood
   */
  const generateInviteLink = async () => {
    if (!user || !neighborhood?.id) {
      toast.error("You must be logged in and part of a neighborhood to generate an invite link");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Generate a unique invite code
      const inviteCode = `${Math.random().toString(36).substring(2, 8)}${Date.now().toString(36)}`;
      
      // Store the invitation in the database
      const { error } = await supabase
        .from('invitations')
        .insert({
          neighborhood_id: neighborhood.id, // Use neighborhood.id (string) instead of the whole object
          inviter_id: user.id,
          invite_code: inviteCode,
        });
      
      if (error) {
        throw error;
      }
      
      // Create the full invitation link using the correct base URL
      const baseUrl = getBaseUrl();
      const link = `${baseUrl}/join/${inviteCode}`;
      
      console.log("[NeighborhoodInviteLink] Generated invite URL:", link);
      
      setInviteLink(link);
      
    } catch (error) {
      console.error("Error generating invite link:", error);
      toast.error("Failed to generate invite link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Copies the invite link to clipboard
   */
  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Invite link copied to clipboard!");
    
    // Reset the "copied" state after a delay
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Generate a link on component mount if none exists
  useEffect(() => {
    if (!inviteLink && user && neighborhood?.id) {
      generateInviteLink();
    }
  }, [user, neighborhood]);
  
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div>
        <Label htmlFor="inviteLink">Share this link with neighbors</Label>
        <div className="flex mt-2 gap-2">
          <Input
            id="inviteLink"
            value={inviteLink}
            readOnly
            className="flex-1"
            placeholder={isLoading ? "Generating link..." : "No invite link generated"}
          />
          <Button
            onClick={copyToClipboard}
            disabled={!inviteLink || isLoading}
            variant="outline"
            size="icon"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Anyone with this link can join your neighborhood.
        </p>
        <Button 
          onClick={generateInviteLink}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? "Generating..." : "Generate New Link"}
        </Button>
      </div>
    </div>
  );
};

export default NeighborhoodInviteLink;
