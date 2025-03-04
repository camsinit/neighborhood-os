
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Mail, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react"; // Added useEffect for timeout detection
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
  // New state to detect stuck loading state
  const [loadingTooLong, setLoadingTooLong] = useState(false);
  
  // Get required hooks
  const { toast } = useToast();
  const user = useUser();
  const { 
    currentNeighborhood, 
    isLoading, 
    error, 
    isCoreContributor,
    refreshNeighborhoodData // Get the refresh function 
  } = useNeighborhood();

  // Use effect to detect if we're stuck in a loading state for too long
  useEffect(() => {
    // Only start timer if dialog is open and we're loading
    if (open && isLoading) {
      console.log("[InviteDialog] Starting loading timeout detection");
      
      // Set a timeout to detect if loading takes too long
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          console.log("[InviteDialog] Loading timeout triggered - loading took too long");
          setLoadingTooLong(true);
        }
      }, 3000); // 3 seconds is a reasonable time for data to load
      
      return () => {
        clearTimeout(timeoutId);
      };
    } else if (!isLoading) {
      // Reset the loading too long flag when we're no longer loading
      setLoadingTooLong(false);
    }
  }, [open, isLoading]);

  // Debug log when component renders
  useEffect(() => {
    if (open) {
      console.log("[InviteDialog] Render state:", {
        user: !!user,
        currentNeighborhood,
        isLoading,
        error,
        isGeneratingLink,
        isCoreContributor,
        loadingTooLong
      });
      
      if (isLoading) {
        console.log("[InviteDialog] Still loading...");
      }
    }
  }, [open, user, currentNeighborhood, isLoading, error, isGeneratingLink, isCoreContributor, loadingTooLong]);

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
  
  /**
   * Handle manual refresh of neighborhood data
   */
  const handleRefreshData = () => {
    console.log("[InviteDialog] Manually refreshing neighborhood data");
    refreshNeighborhoodData();
    setLoadingTooLong(false); // Reset our loading timeout detection
    
    toast({
      title: "Refreshing neighborhood data",
      description: "Please wait while we reconnect to your neighborhood...",
    });
  };

  /**
   * Diagnose the current state and provide debugging information
   */
  const runNeighborhoodDiagnostics = async () => {
    if (!user) {
      console.log("[Diagnostics] No user found");
      toast({
        title: "No user found",
        description: "Please login again to resolve this issue.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("[Diagnostics] Running neighborhood diagnostics for user:", user.id);
      
      // Check if user has created neighborhoods - using security definer functions
      const createdNeighborhoods = await fetchCreatedNeighborhoods(user.id);
      
      // Check if user is a core contributor
      const isCoreContrib = await checkCoreContributorAccess(user.id);
      
      // Get neighborhood details from all neighborhoods 
      const allNeighborhoods = await fetchAllNeighborhoods();
      
      // Log diagnostic information
      const diagnosticInfo = {
        userId: user.id,
        createdNeighborhoods: createdNeighborhoods || [],
        isCoreContributor: isCoreContrib,
        availableNeighborhoods: allNeighborhoods || [],
        timestamp: new Date().toISOString()
      };
      
      console.log("[Diagnostics] Results:", diagnosticInfo);
      
      // Show diagnostic info to user
      toast({
        title: "Diagnostic Information",
        description: `Found ${createdNeighborhoods?.length || 0} created neighborhoods and ${allNeighborhoods?.length || 0} total neighborhoods.`,
      });
      
      // If no neighborhoods found, show a more detailed message
      if ((!createdNeighborhoods || createdNeighborhoods.length === 0) && 
          (!allNeighborhoods || allNeighborhoods.length === 0)) {
        toast({
          title: "No neighborhood association found",
          description: "You don't appear to be connected to any neighborhood. Try joining with an invite link or creating a new neighborhood.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("[Diagnostics] Error:", error);
      toast({
        title: "Diagnostic error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  // Helper functions to get neighborhoods data safely without RLS recursion
  async function fetchCreatedNeighborhoods(userId: string) {
    const { data, error } = await supabase
      .rpc('get_user_created_neighborhoods', { user_uuid: userId });
    
    if (error) {
      console.error("[Diagnostics] Error fetching created neighborhoods:", error);
      return [];
    }
    
    return data || [];
  }
  
  async function checkCoreContributorAccess(userId: string) {
    const { data, error } = await supabase
      .rpc('user_is_core_contributor_with_access', { user_uuid: userId });
    
    if (error) {
      console.error("[Diagnostics] Error checking core contributor:", error);
      return false;
    }
    
    return !!data;
  }
  
  async function fetchAllNeighborhoods() {
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id, name');
    
    if (error) {
      console.error("[Diagnostics] Error fetching all neighborhoods:", error);
      return [];
    }
    
    return data || [];
  }

  // Calculate if we're in a stuck loading state (loading for too long)
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
