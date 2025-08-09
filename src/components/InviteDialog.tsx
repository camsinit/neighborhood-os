
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react"; 
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNeighborhood } from "@/contexts/NeighborhoodContext";
import { Neighborhood } from "@/contexts/neighborhood/types";
import { 
  fetchCreatedNeighborhoods
} from "@/contexts/neighborhood/utils/neighborhoodFetchUtils";
import { createLogger } from "@/utils/logger";

// Dedicated logger for this dialog
const logger = createLogger('InviteDialog');

/**
 * InviteDialog Component
 * 
 * This component allows existing neighborhood members to invite others.
 * It generates unique invite codes tied to both the neighborhood and the inviter.
 * Core contributor functionality has been removed.
 * Reduced toast notifications to essential errors only.
 */
const InviteDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  // State for the email input and link generation process
  const [email, setEmail] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [loadingTooLong, setLoadingTooLong] = useState(false);
  const [emailError, setEmailError] = useState(""); // Inline error for email validation
  
  // Get required hooks
  const user = useUser();
  const { 
    currentNeighborhood, 
    isLoading, 
    error, 
    refreshNeighborhoodData
  } = useNeighborhood();

  // Fetch user's profile to get the correct display name
  // This ensures we show the user's actual name instead of their email address
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();
      
      if (error) {
        logger.error('Error fetching profile for invitation:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  // Use effect to detect if we're stuck in a loading state for too long
  useEffect(() => {
    if (open && isLoading) {
      logger.info("Starting loading timeout detection");
      
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          logger.warn("Loading timeout triggered - loading took too long");
          setLoadingTooLong(true);
        }
      }, 3000);
      
      return () => {
        clearTimeout(timeoutId);
      };
    } else if (!isLoading) {
      setLoadingTooLong(false);
    }
  }, [open, isLoading]);

  // Debug log when component renders
  useEffect(() => {
    if (open) {
      logger.debug("Render state", {
        user: !!user,
        currentNeighborhood,
        isLoading,
        error,
        isGeneratingLink,
        loadingTooLong
      });
      
      if (isLoading) {
        logger.debug("Still loading...");
      }
    }
  }, [open, user, currentNeighborhood, isLoading, error, isGeneratingLink, loadingTooLong]);

  /**
   * Get the correct base URL for invite links
   * Uses production domain in production, fallback to current origin for development
   */
  const getBaseUrl = (): string => {
    // In emails, links must always use our public site URL (not preview domains)
    return 'https://neighborhoodos.com';
  };

  /**
   * Generates a unique invitation link and copies it to clipboard
   * Only shows toast for critical errors and success (since clipboard action isn't obvious)
   */
  const generateAndCopyLink = async () => {
    if (!user || !currentNeighborhood) {
      logger.warn("Cannot generate link", { hasUser: !!user, hasNeighborhood: !!currentNeighborhood });
      
      if (!currentNeighborhood) {
        toast.error("No neighborhood available. You need to be part of a neighborhood to invite others.");
        return;
      }
      return;
    }
    
    setIsGeneratingLink(true);
    try {
      const inviteCode = crypto.randomUUID();
      
      logger.info("Generating invite for neighborhood", { neighborhoodId: currentNeighborhood.id });
      
      const { error } = await supabase.from("invitations").insert({
        invite_code: inviteCode,
        inviter_id: user.id,
        neighborhood_id: currentNeighborhood.id,
      });

      if (error) throw error;

      const baseUrl = getBaseUrl();
      const inviteUrl = `${baseUrl}/join/${inviteCode}`;
      
      logger.info("Generated invite URL", { inviteUrl });
      
      await navigator.clipboard.writeText(inviteUrl);
      
      // Success toast is needed here because clipboard action isn't visually obvious
      toast.success("Invite link copied! You can now share this link with your neighbor.");
    } catch (error: any) {
      logger.error("Error generating invite", error);
      toast.error("Error generating invite link: " + error.message);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  /**
   * Send email invitation via Resend API
   * Validates email and sends invitation with proper error handling
   */
  const sendEmailInvite = async () => {
    setEmailError(""); // Clear previous errors
    
    if (!email.trim()) {
      setEmailError("Email address is required");
      return;
    }
    
    if (!email.includes('@')) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    if (!currentNeighborhood) {
      toast.error("No neighborhood available. You need to be part of a neighborhood to invite others.");
      return;
    }
    
    if (!user) {
      toast.error("You must be logged in to send invitations");
      return;
    }

    try {
      // Generate invite code
      const inviteCode = crypto.randomUUID();
      
      // Create invitation record in database
      const { error: inviteError } = await supabase.from("invitations").insert({
        invite_code: inviteCode,
        inviter_id: user.id,
        neighborhood_id: currentNeighborhood.id,
        email: email.trim(),
      });

      if (inviteError) throw inviteError;

      // Send email via edge function using the profile display_name
      // Use the profile display_name first, fallback to a friendly neighbor greeting
      // instead of showing the email address to recipients
      const inviterDisplayName = profile?.display_name || 
                                 user.user_metadata?.display_name || 
                                 user.email?.split('@')[0] || 
                                 'Your neighbor';

      const { error: emailError } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: email.trim(),
          inviterName: inviterDisplayName,
          neighborhoodName: currentNeighborhood.name,
          inviteCode: inviteCode
        }
      });

      if (emailError) throw emailError;

      toast.success("Invitation sent successfully!");
      setEmail("");
    } catch (error: any) {
      logger.error("Error sending invitation", error);
      toast.error("Failed to send invitation: " + error.message);
    }
  };
  
  /**
   * Handle manual refresh of neighborhood data
   */
  const handleRefreshData = () => {
    logger.info("Manually refreshing neighborhood data");
    refreshNeighborhoodData();
    setLoadingTooLong(false);
    
    // Brief informational toast for this action
    toast("Refreshing neighborhood data", {
      description: "Please wait while we reconnect to your neighborhood..."
    });
  };

  /**
   * Diagnose the current state and provide debugging information
   */
  const runNeighborhoodDiagnostics = async () => {
    if (!user) {
      logger.warn("Diagnostics: no user found");
      toast.error("No user found. Please login again to resolve this issue.");
      return;
    }
    
    try {
      logger.info("Running neighborhood diagnostics", { userId: user.id });
      
      const { data: createdNeighborhoods, error: createdError } = await fetchCreatedNeighborhoods(user.id);
      
      const diagnosticInfo = {
        userId: user.id,
        createdNeighborhoods: createdNeighborhoods || [],
        timestamp: new Date().toISOString()
      };
      
      logger.info("Diagnostics results", diagnosticInfo);
      
      // Brief informational toast
      toast("Diagnostic Information", {
        description: `Found ${Array.isArray(createdNeighborhoods) ? createdNeighborhoods.length : 0} created neighborhoods.`
      });
      
      if (!createdNeighborhoods || (Array.isArray(createdNeighborhoods) && createdNeighborhoods.length === 0)) {
        toast.error("No neighborhood association found. You don't appear to be connected to any neighborhood. Try joining with an invite link or creating a new neighborhood.");
      }
    } catch (error: any) {
      logger.error("Diagnostics error", error);
      toast.error("Diagnostic error: " + error.message);
    }
  };

  const isStuckLoading = isLoading && open && loadingTooLong;

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
          {/* Loading state indicator */}
          {isStuckLoading && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
              <p className="text-sm text-amber-800 mb-2">
                Still loading your neighborhood data...
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-amber-600 border-amber-200 bg-amber-50"
                  onClick={handleRefreshData}
                >
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Refresh Neighborhood Data
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-blue-600 border-blue-200 bg-blue-50"
                  onClick={runNeighborhoodDiagnostics}
                >
                  Run Diagnostics
                </Button>
              </div>
            </div>
          )}
          
          {/* If error, show error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-md">
              <p className="text-sm text-red-800 mb-2">
                Error loading neighborhood: {error.message}
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-red-600 border-red-200 bg-red-50"
                  onClick={handleRefreshData}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-blue-600 border-blue-200 bg-blue-50"
                  onClick={runNeighborhoodDiagnostics}
                >
                  Run Diagnostics
                </Button>
              </div>
            </div>
          )}
          
          {/* If no neighborhood, show message and diagnostic button */}
          {!isLoading && !currentNeighborhood && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
              <p className="text-sm text-yellow-800 mb-2">
                You need to be part of a neighborhood before you can invite others.
                Please use an invitation link from an existing member to join a neighborhood.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-blue-600 border-blue-200 bg-blue-50 mt-2"
                onClick={runNeighborhoodDiagnostics}
              >
                Check Neighborhood Status
              </Button>
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(""); // Clear error when typing
                    }}
                    className={emailError ? "border-red-300" : ""}
                  />
                  <Button onClick={sendEmailInvite} size="icon">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
                {/* Show inline error for email validation */}
                {emailError && (
                  <p className="text-sm text-red-600">{emailError}</p>
                )}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteDialog;
